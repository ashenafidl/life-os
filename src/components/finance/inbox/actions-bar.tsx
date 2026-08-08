"use client";

import { ArrowClockwiseIcon, TrashIcon } from "@phosphor-icons/react";

import { deleteAllUnmatched, parseAllMessages } from "@/actions/finance";
import DataTableActionBar from "@/components/table/data-table-action-bar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export default function ActionsBar() {
  return (
    <DataTableActionBar className="flex-1">
      <ButtonGroup>
        <Button variant="outline" onClick={() => parseAllMessages("unmatched")}>
          <ArrowClockwiseIcon /> Reparse Unmatched
        </Button>
        <Button variant="outline" onClick={() => parseAllMessages("all")}>
          <ArrowClockwiseIcon /> Reparse All
        </Button>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={deleteAllUnmatched}
        >
          <TrashIcon /> Delete Unmatched
        </Button>
      </ButtonGroup>
    </DataTableActionBar>
  );
}
