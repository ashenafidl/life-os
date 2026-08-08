import { isNotNull, desc, sql, and, gte, lt, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";
import { MatchedField, TransactionReview } from "@/types/transaction-review";

export const getBankBalances = cache(async () => {
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
});

export const getDailyTotals = cache(
  async (from: Date, to: Date): Promise<Record<string, number>> => {
    const rows = await db
      .select({
        day: sql<string>`to_char(${transactions.occurredAt}, 'YYYY-MM-DD')`,
        net: sql<string>`sum(
        case when ${transactions.type} = 'income'
          then ${transactions.amount}
          else -${transactions.amount}
        end
      )`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.occurredAt, from),
          lt(transactions.occurredAt, to),
        ),
      )
      .groupBy(sql`1`);

    return Object.fromEntries(rows.map((r) => [r.day, Number(r.net)]));
  },
);

export const getMessages = cache(async () => {
  return await db.select().from(smsMessages).orderBy(desc(smsMessages.date));
});

export const getTransactionReview = cache(
  async (): Promise<TransactionReview[]> => {
    const rows = await db
      .select({
        transaction: transactions,
        bankName: banks.name,
        body: smsMessages.body,
        pattern: bankPatterns,
      })
      .from(transactions)
      .innerJoin(smsMessages, eq(transactions.smsMessageId, smsMessages.id))
      .innerJoin(bankPatterns, eq(transactions.patternId, bankPatterns.id))
      .innerJoin(banks, eq(transactions.bankId, banks.id))
      .orderBy(desc(transactions.occurredAt));

    return rows.map((row) => {
      const fields: MatchedField[] = [];

      try {
        const regex = new RegExp(row.pattern.regex, "id");
        const match = regex.exec(row.body);

        if (match?.indices?.groups) {
          for (const [name, range] of Object.entries(match.indices.groups)) {
            if (!range) continue;
            const [start, end] = range;
            fields.push({
              name,
              value: row.body.slice(start, end),
              start,
              end,
            });
          }
        }
      } catch {
        // malformed pattern — fall through with no highlighted fields,
        // the raw body still renders plain in the viewer
      }

      fields.sort((a, b) => a.start - b.start);

      return {
        transaction: row.transaction,
        bankName: row.bankName,
        body: row.body,
        fields,
        pattern: row.pattern,
      };
    });
  },
);
