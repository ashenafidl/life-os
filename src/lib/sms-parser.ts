// oxlint-disable no-console
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";
import { toEpoch } from "@/lib/date-utils";

type BankWithPatterns = typeof banks.$inferSelect & {
  patterns: (typeof bankPatterns.$inferSelect)[];
};

function findBank(address: string, allBanks: BankWithPatterns[]) {
  return allBanks.find((bank) => {
    try {
      return bank.shortCodes.includes(address);
    } catch {
      return false;
    }
  });
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

  const fullRegex = new RegExp(inputRegex, "id");
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
      const ok = new RegExp(truncated, "id").test(body);
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

function matchPattern(body: string, patterns: BankWithPatterns["patterns"]) {
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.regex, "i");
      const match = body.match(regex);
      if (match?.groups) {
        return { pattern, groups: match.groups };
      } else if (process.env.NODE_ENV === "development") {
        debugMatch(body, pattern.regex);
      }
    } catch {
      continue;
    }
  }
  return null;
}

function stripCommas(value: string) {
  return typeof value === "string" ? value?.replace(/,/g, "") : value;
}

export async function parseMessages(
  messages: (typeof smsMessages.$inferSelect)[],
) {
  const allBanks = await db.query.banks.findMany({
    with: {
      patterns: true,
    },
  });

  let parsed = 0;
  let unmatched = 0;

  for (const msg of messages) {
    const bank = findBank(msg.address, allBanks);

    if (!bank) {
      await db
        .update(smsMessages)
        .set({ status: "unmatched", parsedAt: new Date() })
        .where(eq(smsMessages.id, msg.id));
      unmatched++;
      continue;
    }

    const result = matchPattern(msg.body, bank.patterns);

    if (!result) {
      // Known bank, but no pattern matched — likely a non-transaction sms
      // (OTP, promo) or a real transaction in a shape we haven't written a
      // regex for yet. bankId being set is what lets a review UI tell these
      // apart from truly-unrecognized senders.
      await db
        .update(smsMessages)
        .set({ status: "unmatched", bankId: bank.id, parsedAt: new Date() })
        .where(eq(smsMessages.id, msg.id));
      unmatched++;
      continue;
    }

    const { pattern, groups } = result;

    await db.transaction(async (tx) => {
      await tx
        .insert(transactions)
        .values({
          smsMessageId: msg.id,
          bankId: bank.id,
          patternId: pattern.id,
          tnxId: groups.tnxId,
          type: pattern.type,
          sender: groups.sender,
          senderAccount: groups.senderAccount,
          recipientName: groups.recipientName,
          recipientPhone: groups.recipientPhone,
          senderPhone: groups.senderPhone,
          amount: stripCommas(groups.amount) ?? 0,
          totalAmount: stripCommas(groups.totalAmount) ?? 0,
          serviceCharge: stripCommas(groups.serviceCharge) ?? 0,
          vat: stripCommas(groups.vat) ?? 0,
          disasterRecovery: stripCommas(groups.disasterRecovery) ?? 0,
          balanceAfter: groups.balanceAfter
            ? stripCommas(groups.balanceAfter)
            : null,
          reference: groups.reference ?? null,
          occurredAt: groups.dateTime
            ? toEpoch(groups.date, groups.time)
            : msg.date,
        })
        .onConflictDoUpdate({
          target: transactions.smsMessageId,
          set: {
            bankId: bank.id,
            patternId: pattern.id,
            tnxId: groups.tnxId,
            type: pattern.type,
            sender: groups.sender,
            senderAccount: groups.senderAccount,
            recipientName: groups.recipientName,
            recipientPhone: groups.recipientPhone,
            senderPhone: groups.senderPhone,
            amount: stripCommas(groups.amount),
            totalAmount: stripCommas(groups.totalAmount) ?? 0,
            serviceCharge: stripCommas(groups.serviceCharge) ?? 0,
            vat: stripCommas(groups.vat) ?? 0,
            disasterRecovery: stripCommas(groups.disasterRecovery) ?? 0,
            balanceAfter: groups.balanceAfter
              ? stripCommas(groups.balanceAfter)
              : null,
            reference: groups.reference ?? null,
            occurredAt: groups.dateTime
              ? toEpoch(groups.date, groups.time)
              : msg.date,
          },
        });

      await tx
        .update(smsMessages)
        .set({ status: "parsed", bankId: bank.id, parsedAt: new Date() })
        .where(eq(smsMessages.id, msg.id));
    });

    parsed++;
  }

  // oxlint-disable-next-line no-console
  console.log({ attempted: messages.length, parsed, unmatched });
  return { attempted: messages.length, parsed, unmatched };
}

export async function parsePendingMessages() {
  const pendingMessages = await db
    .select()
    .from(smsMessages)
    .where(eq(smsMessages.status, "pending"));

  return parseMessages(pendingMessages);
}
