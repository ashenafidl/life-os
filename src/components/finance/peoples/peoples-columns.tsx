"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Route } from "next";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import formatMoney from "@/lib/money-utils";
import type { PeopleOverviewRow } from "@/lib/queries/finance";

const columnHelper = createColumnHelper<PeopleOverviewRow>();

export const peoplesColumns: ColumnDef<PeopleOverviewRow, any>[] = [
  columnHelper.accessor("person.name", {
    id: "name",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Person" />
    ),
    cell: (info) => (
      <Link
        href={`/finance/peoples/${info.row.original.person.id}` as Route}
        className="font-medium hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("aliases", {
    id: "aliases",
    header: "Aliases",
    enableSorting: false,
    cell: (info) => {
      const aliases = info.getValue<string[]>();
      if (aliases.length === 0) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {aliases.map((alias) => (
            <Badge key={alias} variant="secondary">
              {alias}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor("sent", {
    id: "sent",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Sent" />
    ),
    cell: (info) => (
      <span className="text-destructive tabular-nums">
        {formatMoney(info.getValue(), { showCurrency: true })}
      </span>
    ),
  }),
  columnHelper.accessor("received", {
    id: "received",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Received" />
    ),
    cell: (info) => (
      <span className="text-green-600 tabular-nums dark:text-green-500">
        {formatMoney(info.getValue(), { showCurrency: true })}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.received - row.sent, {
    id: "net",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Net" />
    ),
    cell: (info) => {
      const net = info.getValue();
      return (
        <span className="font-medium tabular-nums">
          {formatMoney(net, { showCurrency: true })}
        </span>
      );
    },
  }),
  columnHelper.accessor("transactionCount", {
    id: "transactionCount",
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="Transactions" />
    ),
    cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
  }),
];
