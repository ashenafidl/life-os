"use client";

import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useState, useTransition } from "react";

import { addPersonAlias, removePersonAlias } from "@/actions/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Alias {
  id: string;
  alias: string;
}

interface Props {
  personId: string;
  aliases: Alias[];
}

export default function PersonAliasesEditor({ personId, aliases }: Props) {
  const [alias, setAlias] = useState("");
  const [pending, startTransition] = useTransition();

  const trimmedAlias = alias.trim();

  const handleAdd = () => {
    if (!trimmedAlias) return;

    startTransition(async () => {
      await addPersonAlias(personId, trimmedAlias);
      setAlias("");
    });
  };

  const handleRemove = (aliasId: string) => {
    startTransition(async () => {
      await removePersonAlias(aliasId);
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        Aliases
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {aliases.length === 0 && (
          <span className="text-muted-foreground text-sm">No aliases yet.</span>
        )}

        {aliases.map((item) => (
          <Badge
            key={item.id}
            variant="secondary"
            className="rounded-full py-3 pr-0! pl-2"
          >
            <span>{item.alias}</span>
            <Button
              variant="ghost"
              aria-label={`Remove ${item.alias}`}
              className="flex size-6 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20"
              onClick={() => handleRemove(item.id)}
            >
              <XIcon className="size-2.5" />
            </Button>
          </Badge>
        ))}
      </div>

      <div className="flex max-w-sm items-center gap-2">
        <Input
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add an alias"
          className="h-8"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!trimmedAlias || pending}
        >
          <PlusIcon /> Add
        </Button>
      </div>
    </div>
  );
}
