"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import FormattedDate from "@/components/shared/formatted-date";
import DataTableLinkCell from "@/components/table/cells/data-table-link-cell";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { transactions } from "@/db/schema/finance";
import formatMoney from "@/lib/money-utils";

type Transaction = typeof transactions.$inferSelect;

const columnHelper = createColumnHelper<Transaction>();

export const tnxColumns: ColumnDef<Transaction, any>[] = [
  columnHelper.accessor("sender", {
    id: "sender",
  }),
  columnHelper.accessor("senderAccount", {
    id: "senderAccount",
  }),
  columnHelper.accessor("amount", {
    id: "amount",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Amount" />
    ),
    cell: (amount) => formatMoney(amount.getValue()),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("serviceCharge", {
    id: "serviceCharge",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Service Charge" />
    ),
    cell: (amount) => formatMoney(amount.getValue()),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("vat", {
    id: "vat",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="VAT" />
    ),
    cell: (amount) => formatMoney(amount.getValue()),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("disasterRecovery", {
    id: "disasterRecovery",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Disaster Recovery" />
    ),
    cell: (amount) => formatMoney(amount.getValue()),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("totalAmount", {
    id: "totalAmount",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Total Amount" />
    ),
    cell: (amount) => formatMoney(amount.getValue()),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("balanceAfter", {
    id: "balanceAfter",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Balance After" />
    ),
    cell: (balanceAFter) => formatMoney(balanceAFter.getValue()),
  }),
  columnHelper.accessor("occurredAt", {
    id: "occurredAt",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Occurred At" />
    ),
    cell: (occurredAt) => <FormattedDate date={occurredAt.getValue()} />,
    sortingFn: "datetime",
  }),
  columnHelper.accessor("reference", {
    id: "reference",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Ref Link" />
    ),
    cell: (reference) => <DataTableLinkCell href={reference.getValue()} />,
    enableSorting: false,
  }),
];
