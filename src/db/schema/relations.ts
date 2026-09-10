import { defineRelations } from "drizzle-orm";

import {
  bankPatterns,
  banks,
  categories,
  smsMessages,
  transactionCategories,
  transactionLinks,
  transactions,
} from "@/db/schema/finance";

export const relations = defineRelations(
  {
    banks,
    bankPatterns,
    smsMessages,
    transactions,
    transactionCategories,
    transactionLinks,
    categories,
  },
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
      categoryLinks: r.many.transactionCategories({
        from: r.transactions.id,
        to: r.transactionCategories.transactionId,
      }),
      // The refund itself, if this transaction IS a refund pointing at another.
      outgoingLink: r.one.transactionLinks({
        from: r.transactions.id,
        to: r.transactionLinks.transactionId,
      }),
      // The refund pointing back at this transaction, if this transaction
      // is the ORIGINAL that got refunded.
      incomingLink: r.one.transactionLinks({
        from: r.transactions.id,
        to: r.transactionLinks.linkedTransactionId,
      }),
    },

    categories: {
      transactionLinks: r.many.transactionCategories({
        from: r.categories.id,
        to: r.transactionCategories.categoryId,
      }),
    },

    transactionCategories: {
      transaction: r.one.transactions({
        from: r.transactionCategories.transactionId,
        to: r.transactions.id,
      }),
      category: r.one.categories({
        from: r.transactionCategories.categoryId,
        to: r.categories.id,
      }),
    },

    transactionLinks: {
      transaction: r.one.transactions({
        from: r.transactionLinks.transactionId,
        to: r.transactions.id,
      }),
      linkedTransaction: r.one.transactions({
        from: r.transactionLinks.linkedTransactionId,
        to: r.transactions.id,
      }),
    },
  }),
);
