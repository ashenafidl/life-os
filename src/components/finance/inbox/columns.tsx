"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import Image from "next/image";

import SmsStatusBadge from "@/components/finance/sms-status-badge";
import DataTableLongTextCell from "@/components/table/cells/data-table-long-text-cell";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { banks, smsMessages } from "@/db/schema/finance";

type SmsMessage = typeof smsMessages.$inferSelect;
type Bank = typeof banks.$inferSelect;

type InboxMessages = {
  sms: SmsMessage;
  bank: Bank;
};
const columnHelper = createColumnHelper<InboxMessages>();

export const inboxColumns: ColumnDef<InboxMessages, any>[] = [
  columnHelper.accessor("bank.id", {
    id: "bank",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Bank" />
    ),
    cell: (info) => {
      const { name, logoPath } = info.row.original.bank;
      return (
        <div className="flex flex-row items-center gap-2">
          <div className="relative flex size-6 items-center justify-center overflow-auto rounded-full bg-white/90">
            <Image
              src={logoPath ?? ""}
              alt={name}
              fill
              className="rounded-full object-contain p-0.5"
            />
          </div>
          <span>{name}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("sms.address", {
    id: "address",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Address" />
    ),
  }),
  columnHelper.accessor("sms.smsId", {
    id: "smsId",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="SMS ID" />
    ),
  }),
  columnHelper.accessor("sms.body", {
    id: "body",
    header: "Body",
    cell: (body) => <DataTableLongTextCell text={body.getValue()} />,
  }),
  columnHelper.accessor("sms.dateSent", {
    id: "dateSent",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Date Sent" />
    ),
    cell: (date) => (
      <span>{formatDate(date.getValue(), "MMM d, yyyy 'at' HH:mm:ss")}</span>
    ),
    sortingFn: "datetime",
  }),
  columnHelper.accessor("sms.date", {
    id: "date",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Date" />
    ),
    cell: (date) => (
      <span>{formatDate(date.getValue(), "MMM d, yyyy 'at' HH:mm:ss")}</span>
    ),
    sortingFn: "datetime",
  }),
  columnHelper.accessor("sms.status", {
    id: "status",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Status" />
    ),
    cell: (status) => <SmsStatusBadge status={status.getValue()} />,
  }),
  columnHelper.accessor("sms.rawHash", { id: "rawHash", header: "Raw Hash" }),
];
