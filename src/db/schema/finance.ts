import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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
  date: timestamp("received_at").notNull(), // when the phone received it
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

export const bankPatterns = pgTable(
  "bank_patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // human label, e.g. "Debit alert", "Transfer confirmation"
    regex: text("regex").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uniquePerBank").on(table.bankId, table.label)],
);

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
  tnxId: text("tnx_id").unique(),
  sender: text("sender"),
  senderAccount: text("sender_account"),
  recipientName: text("recipient_name"),
  recipientPhone: text("recipient_phone"),
  senderPhone: text("sender_phone"),
  serviceCharge: numeric("service_charge", {
    precision: 14,
    scale: 2,
  }),
  vat: numeric("vat", {
    precision: 14,
    scale: 2,
  }),
  disasterRecovery: numeric("disaster_recovery", {
    precision: 14,
    scale: 2,
  }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2 }),
  reference: text("reference"),
  occurredAt: timestamp("occurred_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
