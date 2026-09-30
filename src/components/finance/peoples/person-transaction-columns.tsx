"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { formatDate } from "date-fns";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { transactions } from "@/db/schema/finance";
import formatMoney from "@/lib/money-utils";

type Row = {
  transaction: typeof transactions.$inferSelect;
  bankName: string | null;
  source: "auto" | "manual";
};

const columnHelper = createColumnHelper<Row>();

export const personTransactionColumns: ColumnDef<Row, any>[] = [
  columnHelper.accessor("transaction.occurredAt", {
    id: "occurredAt",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Date" />
    ),
    cell: (info) => (
      <span>{formatDate(info.getValue(), "MMM d, yyyy 'at' HH:mm:ss")}</span>
    ),
    sortingFn: "datetime",
  }),
  columnHelper.accessor("bankName", {
    id: "bank",
    header: "Bank",
    cell: (info) => info.getValue() ?? "Cash",
  }),
  columnHelper.accessor(
    (row) =>
      row.transaction.type === "expense"
        ? row.transaction.recipientName
        : row.transaction.senderName,
    {
      id: "counterparty",
      header: "Counterparty",
      cell: (info) => info.getValue() ?? "—",
    },
  ),
  columnHelper.accessor("transaction.type", {
    id: "type",
    header: "Type",
    cell: (info) => {
      const type = info.getValue();
      return (
        <Badge
          variant={type === "income" ? "secondary" : "destructive"}
          className="capitalize"
        >
          {type}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("transaction.totalAmount", {
    id: "amount",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Amount" />
    ),
    cell: (info) => (
      <span className="tabular-nums">
        {formatMoney(info.getValue(), { showCurrency: true })}
      </span>
    ),
  }),
  columnHelper.accessor("source", {
    id: "source",
    header: "Linked",
    cell: (info) => (
      <span className="text-muted-foreground text-xs capitalize">
        {info.getValue()}
      </span>
    ),
  }),
];
