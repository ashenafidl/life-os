"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

interface DataTableActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export default function DataTableActionBar({
  children,
  className,
  ...props
}: DataTableActionBarProps) {
  return (
    <div>
      <div
        className={cn(
          "flex w-fit flex-wrap items-center justify-center gap-2 rounded-md shadow-sm",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
