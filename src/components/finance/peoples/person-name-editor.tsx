"use client";

import { CheckIcon, TrashIcon } from "@phosphor-icons/react";
import { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deletePerson, updatePerson } from "@/actions/finance";
import AppDialog from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  person: { id: string; name: string };
}

export default function PersonNameEditor({ person }: Props) {
  const router = useRouter();
  const [name, setName] = useState(person.name);
  const [pending, startTransition] = useTransition();

  const trimmedName = name.trim();
  const dirty = trimmedName.length > 0 && trimmedName !== person.name;

  const handleSave = () => {
    startTransition(async () => {
      await updatePerson(person.id, trimmedName);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deletePerson(person.id);
      router.push("/finance/peoples" as Route);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="h-10 max-w-xs text-lg font-semibold"
        aria-label="Person name"
      />

      {dirty && (
        <Button size="sm" onClick={handleSave} disabled={pending}>
          <CheckIcon /> Save
        </Button>
      )}

      <AppDialog
        variant="alert"
        title="Delete person?"
        description={`This removes "${person.name}" and unlinks them from all transactions. This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        trigger={
          <Button variant="ghost" size="sm" className="text-destructive">
            <TrashIcon /> Delete
          </Button>
        }
      />
    </div>
  );
}
