"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import SmsStatusBadge from "@/components/finance/sms-status-badge";
import FormattedDate from "@/components/shared/formatted-date";
import DataTableLongTextCell from "@/components/table/cells/data-table-long-text-cell";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { smsMessages } from "@/db/schema/finance";

type SmsMessage = typeof smsMessages.$inferSelect;

const columnHelper = createColumnHelper<SmsMessage>();

export const inboxColumns: ColumnDef<SmsMessage, any>[] = [
  columnHelper.accessor("smsId", {
    id: "smsId",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="SMS ID" />
    ),
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Status" />
    ),
    cell: (status) => <SmsStatusBadge status={status.getValue()} />,
  }),
  columnHelper.accessor("bankId", {
    id: "bankId",
  }),
  columnHelper.accessor("address", {
    id: "address",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Address" />
    ),
  }),
  columnHelper.accessor("body", {
    id: "body",
    cell: (body) => <DataTableLongTextCell text={body.getValue()} />,
  }),
  columnHelper.accessor("date", {
    id: "date",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Date" />
    ),
    cell: (date) => <FormattedDate date={date.getValue()} />,
    sortingFn: "datetime",
  }),
  columnHelper.accessor("rawHash", { id: "rawHash" }),
];
