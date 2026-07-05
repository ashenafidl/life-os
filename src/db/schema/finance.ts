import { relations } from "drizzle-orm/_relations";
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const smsStatusEnum = pgEnum("sms_status", [
  "pending",
  "parsed",
  "unmatched",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "debit",
  "credit",
  "transfer",
  "withdrawal",
  "deposit",
]);

export const smsMessages = pgTable("sms_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  smsId: integer("sms_id").notNull(),
  address: text("sender").notNull(),
  body: text("body").notNull(),
  date: timestamp("received_at", { withTimezone: true }).notNull(), // when the phone received it
  rawHash: text("raw_hash").notNull().unique(), // sha256(sender+body+receivedAt), for dedup

  // "pending" until a parse attempt runs. "parsed" once a transaction row
  // exists for it. "unmatched" means we tried and no pattern fit — could be
  // a non-transaction sms (promo, OTP) or a real transaction in a format we
  // don't have a regex for yet. bankId lets a review screen tell those apart:
  // unmatched + bankId set = "known bank, need a new/fixed regex";
  // unmatched + bankId null = "sender we don't recognize at all, probably not a bank".
  status: smsStatusEnum("status").notNull().default("pending"),
  bankId: uuid("bank_id").references(() => banks.id, { onDelete: "set null" }),

  parsedAt: timestamp("parsed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(), // when it hit our server
});

export const banks = pgTable("banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  shortCodes: text("short_codes").array().notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bankPatterns = pgTable("bank_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankId: uuid("bank_id")
    .notNull()
    .references(() => banks.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // human label, e.g. "Debit alert", "Transfer confirmation"
  regex: text("regex").notNull(),
  flags: text("flags").notNull().default("i"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  smsMessageId: uuid("sms_message_id")
    .notNull()
    .unique()
    .references(() => smsMessages.id, { onDelete: "cascade" }),
  bankId: uuid("bank_id")
    .notNull()
    .references(() => banks.id),
  patternId: uuid("pattern_id")
    .notNull()
    .references(() => bankPatterns.id),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2 }),
  reference: text("reference"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const banksRelations = relations(banks, ({ many }) => ({
  patterns: many(bankPatterns),
  messages: many(smsMessages),
  transactions: many(transactions),
}));

export const bankPatternsRelations = relations(
  bankPatterns,
  ({ one, many }) => ({
    bank: one(banks, { fields: [bankPatterns.bankId], references: [banks.id] }),
    transactions: many(transactions),
  }),
);

export const smsMessagesRelations = relations(smsMessages, ({ one }) => ({
  bank: one(banks, { fields: [smsMessages.bankId], references: [banks.id] }),
  transaction: one(transactions, {
    fields: [smsMessages.id],
    references: [transactions.smsMessageId],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  smsMessage: one(smsMessages, {
    fields: [transactions.smsMessageId],
    references: [smsMessages.id],
  }),
  bank: one(banks, { fields: [transactions.bankId], references: [banks.id] }),
  pattern: one(bankPatterns, {
    fields: [transactions.patternId],
    references: [bankPatterns.id],
  }),
}));
