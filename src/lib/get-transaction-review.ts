import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";

export interface MatchedField {
  name: string;
  value: string;
  start: number;
  end: number;
}

export interface TransactionReview {
  transaction: typeof transactions.$inferSelect;
  bankName: string;
  body: string;
  fields: MatchedField[];
  pattern: typeof bankPatterns.$inferSelect;
}

export async function getTransactionReview(): Promise<TransactionReview[]> {
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
          fields.push({ name, value: row.body.slice(start, end), start, end });
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
}
