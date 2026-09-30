"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useState, useTransition } from "react";

import { rerunPeopleMatching } from "@/actions/finance";
import AddPersonDialog from "@/components/finance/peoples/add-person-dialog";
import DataTableActionBar from "@/components/table/data-table-action-bar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export default function PeoplesActionsBar() {
  const [result, setResult] = useState<{
    matched: number;
    ambiguous: number;
    skipped: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRerun = () => {
    startTransition(async () => {
      const next = await rerunPeopleMatching();
      setResult(next);
    });
  };

  return (
    <DataTableActionBar className="flex-1 items-center justify-between">
      <ButtonGroup>
        <AddPersonDialog />
        <Button variant="outline" onClick={handleRerun} disabled={pending}>
          <ArrowClockwiseIcon />
          {pending ? "Matching…" : "Re-run matching"}
        </Button>
      </ButtonGroup>

      {result && (
        <p className="text-muted-foreground text-sm">
          Matched {result.matched}, ambiguous {result.ambiguous}, skipped{" "}
          {result.skipped}
        </p>
      )}
    </DataTableActionBar>
  );
}
