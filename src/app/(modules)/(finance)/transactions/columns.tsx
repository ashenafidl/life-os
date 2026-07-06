"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import DataTableLinkCell from "@/components/table/cells/data-table-link-cell";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { transactions } from "@/db/schema/finance";
import formatMoney from "@/lib/money-utils";

type Transaction = typeof transactions.$inferSelect;

const columnHelper = createColumnHelper<Transaction>();

export const tnxColumns: ColumnDef<Transaction, any>[] = [
  columnHelper.accessor("amount", {
    id: "amount",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Amount" />
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
  columnHelper.accessor("reference", {
    id: "reference",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Reference Link" />
    ),
    cell: (reference) => <DataTableLinkCell href={reference.getValue()} />,
    enableSorting: false,
  }),
];
