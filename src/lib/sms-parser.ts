import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";
import { toEpochMs } from "@/lib/date-utils";

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

function matchPattern(body: string, patterns: BankWithPatterns["patterns"]) {
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.regex, "i");
      const match = body.match(regex);
      if (match?.groups?.amount) {
        return { pattern, groups: match.groups };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function stripCommas(value: string) {
  return value.replace(/,/g, "");
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
          sender: groups.sender,
          senderAccount: groups.senderAccount,
          recipientName: groups.recipientName,
          recipientPhone: groups.recipientPhone,
          amount: groups.amount ?? 0,
          totalAmount: groups.totalAmount ?? 0,
          serviceCharge: groups.serviceCharge ?? 0,
          vat: groups.vat ?? 0,
          disasterRecovery: groups.disasterRecovery ?? 0,
          balanceAfter: groups.balanceAfter
            ? stripCommas(groups.balanceAfter)
            : null,
          reference: groups.reference ?? null,
          occurredAt: groups.datTime ? toEpochMs(groups.datTime) : msg.date,
        })
        .onConflictDoUpdate({
          target: transactions.smsMessageId,
          set: {
            bankId: bank.id,
            patternId: pattern.id,
            tnxId: groups.tnxId,
            sender: groups.sender,
            senderAccount: groups.senderAccount,
            recipientName: groups.recipientName,
            recipientPhone: groups.recipientPhone,
            amount: stripCommas(groups.amount),
            totalAmount: groups.totalAmount ?? 0,
            serviceCharge: groups.serviceCharge ?? 0,
            vat: groups.vat ?? 0,
            disasterRecovery: groups.disasterRecovery ?? 0,
            balanceAfter: groups.balanceAfter
              ? stripCommas(groups.balanceAfter)
              : null,
            reference: groups.reference ?? null,
            occurredAt: groups.datTime ? toEpochMs(groups.datTime) : msg.date,
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
