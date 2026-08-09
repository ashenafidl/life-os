import { bankPatterns, smsMessages, transactions } from "@/db/schema/finance";

export interface MatchedField {
  name: string;
  value: string;
  start: number;
  end: number;
}

export interface TransactionReviewMessage {
  id: string;
  status: SmsMessageStatus;
  body: string;
  isOriginal: boolean;
  fields: MatchedField[];
}

export interface TransactionReview {
  transaction: typeof transactions.$inferSelect;
  bankName: string;
  pattern: typeof bankPatterns.$inferSelect;
  messages: TransactionReviewMessage[];
}

export type SmsMessageStatus = (typeof smsMessages.$inferSelect)["status"];
