import { transactionTypeEnum } from "@/db/schema/finance";

export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
