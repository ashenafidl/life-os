import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { smsMessages } from "@/db/schema/finance";

type SmsMessage = typeof smsMessages.$inferSelect;

const columnHelper = createColumnHelper<SmsMessage>();

export const inboxColumns: ColumnDef<SmsMessage, any>[] = [
  columnHelper.accessor("smsId", { id: "smsId" }),
  columnHelper.accessor("address", { id: "address" }),
  columnHelper.accessor("body", { id: "body" }),
  columnHelper.accessor("date", {
    id: "date",
  }),
  columnHelper.accessor("rawHash", { id: "rawHash" }),
];
