"use client";

import {
  CaretDownIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { Column } from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {title}
        {column.getCanSort() &&
          (column.getIsSorted() === "desc" ? (
            <CaretDownIcon />
          ) : column.getIsSorted() === "asc" ? (
            <CaretUpIcon />
          ) : (
            <CaretUpDownIcon />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-28">
        <DropdownMenuCheckboxItem
          className="[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
          checked={column.getIsSorted() === "asc"}
          onClick={() => column.toggleSorting(false)}
        >
          <CaretUpIcon />
          Asc
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
          checked={column.getIsSorted() === "desc"}
          onClick={() => column.toggleSorting(true)}
        >
          <CaretDownIcon />
          Desc
        </DropdownMenuCheckboxItem>
        {column.getIsSorted() && (
          <DropdownMenuItem
            className="[&_svg]:text-muted-foreground pl-2"
            onClick={() => column.clearSorting()}
          >
            <XIcon />
            Reset
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
