import {
  bankPatterns,
  categories,
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
  categories: Array<typeof categories.$inferSelect>;
}

export type SmsMessageStatus = (typeof smsMessages.$inferSelect)["status"];
