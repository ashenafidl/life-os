// oxlint-disable no-console
import { and, eq, gte, lte, ne } from "drizzle-orm";
import type { NodePgTransaction } from "drizzle-orm/node-postgres";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";
import { toEpoch } from "@/lib/date-utils";
import { MatchedField } from "@/types/transaction-review";

type SmsMessage = typeof smsMessages.$inferSelect;
type BankPattern = typeof bankPatterns.$inferSelect;
type BankWithPatterns = typeof banks.$inferSelect & {
  patterns: BankPattern[];
};
type ParsedGroups = Record<string, string>;
type Transaction = typeof transactions.$inferSelect;
type TransactionValues = Omit<typeof transactions.$inferInsert, "smsMessageId">;

/** How close two messages' occurredAt must be to count as the same
 * transaction. Both messages for one transaction arrive within seconds, so
 * a few minutes is a safe tolerance. */
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

function findBank(address: string, allBanks: BankWithPatterns[]) {
  return allBanks.find((bank) => bank.shortCodes?.includes(address));
}

/**
 * Compiled regexes are reused across every message in a batch (and across
 * calls), so a pattern is only parsed once instead of once per message.
 * Invalid patterns are cached as null so they're not re-thrown constantly.
 */
const regexCache = new Map<string, RegExp | null>();

function getPatternRegex(source: string): RegExp | null {
  if (regexCache.has(source)) return regexCache.get(source)!;

  let regex: RegExp | null = null;
  try {
    regex = new RegExp(source, "is");
  } catch {
    // Invalid pattern — treat as no-match and cache the miss.
  }
  regexCache.set(source, regex);
  return regex;
}

function matchFirst(body: string, patterns: BankPattern[]) {
  for (const pattern of patterns) {
    const regex = getPatternRegex(pattern.regex);
    if (!regex) continue;

    const match = body.match(regex);
    if (match?.groups) {
      return { pattern, groups: match.groups };
    }
  }
  return null;
}

function matchPattern(body: string, patterns: BankPattern[]) {
  const result = matchFirst(body, patterns);
  if (result) return result;

  if (process.env.NODE_ENV === "development") {
    for (const pattern of patterns) {
      if (getPatternRegex(pattern.regex)) debugMatch(body, pattern.regex);
    }
  }
  return null;
}

/** Re-runs a pattern's regex against a message body to recover the captured
 * field ranges (needs the `d` flag for match indices). Used by the review
 * screen to highlight extracted fields; mirrors the indices logic that
 * built the regex in the first place. */
export function toMatchedFields(
  body: string,
  regexSource: string,
): MatchedField[] {
  const fields: MatchedField[] = [];

  try {
    const regex = new RegExp(regexSource, "id");
    const match = regex.exec(body);

    if (match?.indices?.groups) {
      for (const [name, range] of Object.entries(match.indices.groups)) {
        if (!range) continue;
        const [start, end] = range;
        fields.push({ name, value: body.slice(start, end), start, end });
      }
    }
  } catch {
    // malformed pattern — fall through with no highlighted fields,
    // the raw body still renders plain in the viewer
  }

  fields.sort((a, b) => a.start - b.start);
  return fields;
}

/** Matches a message body against a bank's patterns and returns the matched
 * pattern plus its extracted field ranges, or null if nothing matches. */
export function extractMessageFields(
  body: string,
  patterns: BankPattern[],
): { pattern: BankPattern; fields: MatchedField[] } | null {
  const result = matchFirst(body, patterns);
  if (!result) return null;

  return {
    pattern: result.pattern,
    fields: toMatchedFields(body, result.pattern.regex),
  };
}

interface GroupBoundary {
  name: string;
  endIndex: number; // position of this group's closing paren
  openDepthAfter: number; // how many enclosing groups are still unclosed at this point
}

/** Finds the closing-paren position of every top-level or nested named
 * group in a regex source string, in the order they close. Skips
 * lookbehind assertions ((?<=...) / (?<!...)), which look similar but
 * aren't named capture groups. */
function findNamedGroupBoundaries(source: string): GroupBoundary[] {
  const boundaries: GroupBoundary[] = [];
  const stack: { name: string | null }[] = [];
  let inCharClass = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];

    if (ch === "\\") {
      i++; // skip escaped char, it can't open/close a group or class
      continue;
    }

    if (inCharClass) {
      if (ch === "]") inCharClass = false;
      continue;
    }

    if (ch === "[") {
      inCharClass = true;
      continue;
    }

    if (ch === "(") {
      const namedMatch = source.slice(i).match(/^\(\?<([A-Za-z_$][\w$]*)>/);
      const isLookbehind = /^\(\?<[=!]/.test(source.slice(i));
      stack.push({ name: !isLookbehind && namedMatch ? namedMatch[1] : null });
      continue;
    }

    if (ch === ")") {
      const opened = stack.pop();
      if (opened?.name) {
        boundaries.push({
          name: opened.name,
          endIndex: i,
          openDepthAfter: stack.length,
        });
      }
      continue;
    }
  }

  return boundaries;
}

function debugMatch(body: string, inputRegex: string) {
  console.log("Body (raw, escaped):", JSON.stringify(body));
  console.log("Regex source:", inputRegex);

  const fullRegex = new RegExp(inputRegex, "ids");
  const fullMatch = body.match(fullRegex);
  console.log("Full match:", fullMatch);
  if (fullMatch) return fullMatch;

  const boundaries = findNamedGroupBoundaries(inputRegex);

  for (const boundary of boundaries) {
    // Truncate right after this group's closing paren, then re-close
    // any still-open enclosing groups so the truncated pattern is valid.
    const truncated =
      inputRegex.slice(0, boundary.endIndex + 1) +
      ")".repeat(boundary.openDepthAfter);

    try {
      const ok = new RegExp(truncated, "ids").test(body);
      console.log(`Matches through group "${boundary.name}":`, ok);
      if (!ok) {
        console.log(
          `--> Breaks in the literal text right after group "${boundary.name}"`,
        );
        console.log("    Truncated pattern that failed:", truncated);
        break;
      }
    } catch (e) {
      console.log(
        `Regex became invalid truncating after "${boundary.name}":`,
        e,
      );
      break;
    }
  }
}

function stripCommas(value: string) {
  return value?.replace(/,/g, "");
}

function toTransactionValues(
  msg: SmsMessage,
  bank: BankWithPatterns,
  pattern: BankPattern,
  groups: ParsedGroups,
): TransactionValues {
  return {
    bankId: bank.id,
    patternId: pattern.id,
    tnxId: groups.tnxID,
    type: pattern.type,
    senderName: groups.senderName,
    senderAccount: groups.senderAccount,
    recipientName: groups.recipientName,
    recipientAccount: groups.recipientAccount,
    recipientPhone: groups.recipientPhone,
    senderPhone: groups.senderPhone,
    amount: stripCommas(groups.amount),
    totalAmount: stripCommas(groups.totalAmount) ?? 0,
    serviceCharge: stripCommas(groups.serviceCharge) ?? 0,
    vat: stripCommas(groups.vat) ?? 0,
    disasterRecovery: stripCommas(groups.disasterRecovery) ?? 0,
    balanceAfter: groups.balanceAfter ? stripCommas(groups.balanceAfter) : null,
    reference: groups.reference ?? null,
    occurredAt: groups.dateTime ? toEpoch(groups.date, groups.time) : msg.date,
  };
}

/** Decides whether an existing transaction and a freshly parsed message are
 * the same transaction. Called only for same-bank, same-amount candidates
 * inside the time window, so it just disambiguates: two distinct same-amount
 * transactions (e.g. sending the same sum twice) must not be merged. Uses
 * every signal available on both sides — transaction id, resulting balance,
 * counterparty, account, receipt link, total. A conflicting signal (different
 * tnxId, or a different balanceAfter) means "not the same". */
function sameTransaction(
  existing: Transaction,
  values: TransactionValues,
): boolean {
  if (existing.tnxId && values.tnxId) {
    return existing.tnxId === values.tnxId;
  }

  if (existing.balanceAfter && values.balanceAfter) {
    return Number(existing.balanceAfter) === Number(values.balanceAfter);
  }

  const sharedFields: [string | null | undefined, string | null | undefined][] =
    [
      [existing.senderPhone, values.senderPhone],
      [existing.senderAccount, values.senderAccount],
      [existing.recipientName, values.recipientName],
      [existing.recipientAccount, values.recipientAccount],
      [existing.recipientPhone, values.recipientPhone],
      [existing.reference, values.reference],
    ];

  for (const [a, b] of sharedFields) {
    if (a && b && a === b) return true;
  }

  const existingTotal = Number(existing.totalAmount);
  const newTotal = Number(values.totalAmount);
  if (
    existing.totalAmount &&
    values.totalAmount &&
    existingTotal !== 0 &&
    existingTotal === newTotal
  ) {
    return true;
  }

  return false;
}

/** Finds an already-parsed transaction this message duplicates. Candidates
 * are narrowed to the same bank + amount + type within a short time window,
 * then sameTransaction disambiguates using tnxId, balanceAfter, counterparty
 * and other shared fields. Only a unique match counts — if more than one
 * candidate lines up, don't guess. Excludes the transaction already linked
 * to this message so re-parsing a parsed message doesn't flip it to
 * "duplicate". */
async function findDuplicateTransaction(
  tx: NodePgTransaction<any>,
  msg: SmsMessage,
  bankId: string,
  values: TransactionValues,
): Promise<Transaction | null> {
  const notSelf = ne(transactions.smsMessageId, msg.id);

  if (values.tnxId) {
    const [byTnxId] = await tx
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.bankId, bankId),
          eq(transactions.tnxId, values.tnxId),
          notSelf,
        ),
      )
      .limit(1);
    if (byTnxId) return byTnxId;
  }

  if (values.amount) {
    const at = values.occurredAt ?? msg.date;
    const conditions = [
      eq(transactions.bankId, bankId),
      eq(transactions.amount, values.amount),
      gte(
        transactions.occurredAt,
        new Date(at.getTime() - DUPLICATE_WINDOW_MS),
      ),
      lte(
        transactions.occurredAt,
        new Date(at.getTime() + DUPLICATE_WINDOW_MS),
      ),
      notSelf,
    ];
    if (values.type) conditions.push(eq(transactions.type, values.type));

    const candidates = await tx
      .select()
      .from(transactions)
      .where(and(...conditions))
      .limit(5);

    const matches = candidates.filter((c) => sameTransaction(c, values));
    if (matches.length === 1) return matches[0];
  }

  return null;
}

/** Fields the primary transaction may lack that a duplicate message can fill.
 * Text/numeric keys are merged only when the primary's value is "absent"
 * (null/empty string for text, null/0 for numerics — 0 is what
 * toTransactionValues writes when a regex didn't capture a fee), so an
 * existing real value is never clobbered. */
function mergeTransactionValues(
  existing: Transaction,
  values: TransactionValues,
): Partial<TransactionValues> {
  const update: Partial<TransactionValues> = {};

  const textKeys = [
    "tnxId",
    "senderName",
    "senderAccount",
    "recipientName",
    "recipientAccount",
    "recipientPhone",
    "senderPhone",
    "reference",
  ] as const;

  for (const key of textKeys) {
    const current = existing[key];
    const next = values[key];
    if (!current && next) update[key] = next;
  }

  const numericKeys = [
    "serviceCharge",
    "vat",
    "disasterRecovery",
    "totalAmount",
    "balanceAfter",
  ] as const;

  for (const key of numericKeys) {
    const current = existing[key];
    const next = values[key];
    const currentAbsent = current === null || Number(current) === 0;
    const nextPresent = next !== null && Number(next) !== 0;
    if (currentAbsent && nextPresent) update[key] = next;
  }

  if (!existing.occurredAt && values.occurredAt) {
    update.occurredAt = values.occurredAt;
  }

  return update;
}

/** Marks a message as unmatched. Passing no bankId leaves it untouched, so
 * this covers both truly-unrecognized senders and known banks that no
 * pattern matched. */
async function markUnmatched(msg: SmsMessage, bankId?: string) {
  await db
    .update(smsMessages)
    .set({ status: "unmatched", bankId, parsedAt: new Date() })
    .where(eq(smsMessages.id, msg.id));
}

type ParseOutcome = "parsed" | "duplicate" | "unmatched";

async function parseMessage(
  msg: SmsMessage,
  allBanks: BankWithPatterns[],
): Promise<ParseOutcome> {
  const bank = findBank(msg.address, allBanks);

  if (!bank) {
    await markUnmatched(msg);
    return "unmatched";
  }

  const result = matchPattern(msg.body, bank.patterns);

  if (!result) {
    // Known bank, but no pattern matched — likely a non-transaction sms
    // (OTP, promo) or a real transaction in a shape we haven't written a
    // regex for yet. bankId being set is what lets a review UI tell these
    // apart from truly-unrecognized senders.
    await markUnmatched(msg, bank.id);
    return "unmatched";
  }

  const { pattern, groups } = result;
  const values = toTransactionValues(msg, bank, pattern, groups);

  return db.transaction(async (tx) => {
    const existing = await findDuplicateTransaction(tx, msg, bank.id, values);

    if (existing) {
      // Another message for the same transaction already parsed into a
      // transaction row — this is the duplicate. The first-parsed message
      // stays the original ("parsed", owns the transaction row); everything
      // after it is marked "duplicate". Combine any info the original is
      // missing (e.g. tnxId) into it rather than creating a second row.
      const update = mergeTransactionValues(existing, values);
      if (Object.keys(update).length > 0) {
        await tx
          .update(transactions)
          .set(update)
          .where(eq(transactions.id, existing.id));
      }

      await tx
        .update(smsMessages)
        .set({
          status: "duplicate",
          bankId: bank.id,
          parsedAt: new Date(),
        })
        .where(eq(smsMessages.id, msg.id));

      return "duplicate";
    }

    await tx
      .insert(transactions)
      .values({ smsMessageId: msg.id, ...values, amount: values.amount ?? 0 })
      .onConflictDoUpdate({
        target: transactions.smsMessageId,
        set: values,
      });

    await tx
      .update(smsMessages)
      .set({
        status: "parsed",
        bankId: bank.id,
        parsedAt: new Date(),
      })
      .where(eq(smsMessages.id, msg.id));

    return "parsed";
  });
}

export async function parseMessages(messages: SmsMessage[]) {
  const allBanks = await db.query.banks.findMany({
    with: {
      patterns: true,
    },
  });

  let parsed = 0;
  let duplicate = 0;
  let unmatched = 0;

  for (const msg of messages) {
    const outcome = await parseMessage(msg, allBanks);
    if (outcome === "parsed") parsed++;
    else if (outcome === "duplicate") duplicate++;
    else unmatched++;
  }

  console.log({ attempted: messages.length, parsed, duplicate, unmatched });
  return { attempted: messages.length, parsed, duplicate, unmatched };
}

export async function parsePendingMessages() {
  const pendingMessages = await db
    .select()
    .from(smsMessages)
    .where(eq(smsMessages.status, "pending"));

  return parseMessages(pendingMessages);
}
