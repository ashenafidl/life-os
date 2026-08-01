import { defineRelations } from "drizzle-orm";

import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";
import { projects } from "@/db/schema/shiplog";

export const relations = defineRelations(
  { banks, bankPatterns, smsMessages, transactions, projects },
  (r) => ({
    banks: {
      patterns: r.many.bankPatterns({
        from: r.banks.id,
        to: r.bankPatterns.bankId,
      }),
      messages: r.many.smsMessages({
        from: r.banks.createdAt,
        to: r.smsMessages.bankId,
      }),
      transactions: r.many.transactions({
        from: r.banks.createdAt,
        to: r.transactions.bankId,
      }),
    },
    projects: {
      tasks: r.many.projects({
        from: r.projects.id,
        to: r.projects.id,
      }),
    },
  }),
);
