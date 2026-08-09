import { defineRelations } from "drizzle-orm";

import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";

export const relations = defineRelations(
  { banks, bankPatterns, smsMessages, transactions },
  (r) => ({
    banks: {
      patterns: r.many.bankPatterns({
        from: r.banks.id,
        to: r.bankPatterns.bankId,
      }),
      messages: r.many.smsMessages({
        from: r.banks.id,
        to: r.smsMessages.bankId,
      }),
      transactions: r.many.transactions({
        from: r.banks.id,
        to: r.transactions.bankId,
      }),
    },
    bankPatterns: {
      bank: r.one.banks({
        from: r.bankPatterns.bankId,
        to: r.banks.id,
      }),
      transactions: r.many.transactions({
        from: r.bankPatterns.id,
        to: r.transactions.patternId,
      }),
    },
    smsMessages: {
      bank: r.one.banks({
        from: r.smsMessages.bankId,
        to: r.banks.id,
      }),
      transaction: r.one.transactions({
        from: r.smsMessages.id,
        to: r.transactions.smsMessageId,
      }),
    },
    transactions: {
      bank: r.one.banks({
        from: r.transactions.bankId,
        to: r.banks.id,
      }),
      pattern: r.one.bankPatterns({
        from: r.transactions.patternId,
        to: r.bankPatterns.id,
      }),
      smsMessage: r.one.smsMessages({
        from: r.transactions.smsMessageId,
        to: r.smsMessages.id,
      }),
    },
  }),
);
