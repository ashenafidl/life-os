"use server";

import { eq } from "drizzle-orm";
import { isNotNull, desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { banks, smsMessages, transactions } from "@/db/schema/finance";
import { parseMessages } from "@/lib/sms-parser";

export async function parseAllMessages() {
  const pendingMessages = await db.select().from(smsMessages);

  return parseMessages(pendingMessages);
}

export async function parseUnmatchedMessages() {
  const pendingMessages = await db
    .select()
    .from(smsMessages)
    .where(eq(smsMessages.status, "unmatched"));

  return parseMessages(pendingMessages);
}

export async function getBankBalances() {
  // "Latest transaction per bank, but only among ones where we actually
  // captured a balance" — a transaction whose regex didn't capture
  // balanceAfter shouldn't count as "the latest known balance."
  const latestPerBank = await db
    .selectDistinctOn([transactions.bankId], {
      bankId: transactions.bankId,
      balanceAfter: transactions.balanceAfter,
      occurredAt: transactions.occurredAt,
    })
    .from(transactions)
    .where(isNotNull(transactions.balanceAfter))
    .orderBy(transactions.bankId, desc(transactions.occurredAt));

  const allBanks = await db.select().from(banks);

  const balances = allBanks.map((bank) => {
    const latest = latestPerBank.find((t) => t.bankId === bank.id);
    return {
      bankId: bank.id,
      bankName: bank.name,
      balance: latest ? Number(latest.balanceAfter) : null, // null = no known balance yet
      asOf: latest?.occurredAt ?? null,
    };
  });

  const total = balances.reduce((sum, b) => sum + (b.balance ?? 0), 0);

  return { balances, total };
}
