"use client";

import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import FilterEditor from "@/components/finance/transactions/filter-editor";
import { Button } from "@/components/ui/button";
import {
  decodeFilters,
  encodeFilters,
  FilterCondition,
  FilterFieldConfig,
} from "@/lib/filters";

interface Props {
  fields: FilterFieldConfig[];
}

export default function TransactionFilters({ fields }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const filters = decodeFilters(searchParams.get("filters"));
  const hasActiveFilters = filters.length > 0;

  const applyFilters = (next: FilterCondition[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.length === 0) {
      params.delete("filters");
    } else {
      params.set("filters", encodeFilters(next));
    }

    params.set("page", "1"); // filters changing invalidates whatever page you were on
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });

    if (next.length === 0) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const toggleOpen = () => {
    if (open) {
      // Closing the editor resets filters, per the requested behavior —
      // clicking "Filters" again is an explicit "start over," not just a hide.
      applyFilters([]);
    } else {
      // Opening with nothing set yet starts with one empty row, so there's
      // something to edit immediately rather than an empty panel.
      applyFilters([
        {
          id: crypto.randomUUID(),
          field: fields[0].key,
          operator: "equals",
          value: "",
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant={hasActiveFilters ? "outline" : "secondary"}
        className="relative transition-colors duration-200"
        onClick={toggleOpen}
      >
        <FunnelSimpleIcon /> Filters
        {hasActiveFilters && (
          <span className="bg-secondary text-secondary-foreground absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full text-[10px] font-medium tabular-nums">
            {filters.length}
          </span>
        )}
      </Button>

      {open && (
        <FilterEditor
          conditions={filters}
          fields={fields}
          onChange={applyFilters}
          onClear={() => applyFilters([])}
        />
      )}
    </div>
  );
}
