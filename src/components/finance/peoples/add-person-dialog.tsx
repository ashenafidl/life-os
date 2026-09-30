"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { revalidateLogic } from "@tanstack/react-form";
import { createInsertSchema } from "drizzle-orm/zod";
import { useState } from "react";
import { z } from "zod";

import { createPerson } from "@/actions/finance";
import AppDialog from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { peoples } from "@/db/schema/finance";
import { useAppForm } from "@/hooks/use-form";

const addPersonSchema = createInsertSchema(peoples, {
  name: z.string().nonempty(),
});

export type PersonInsert = z.infer<typeof addPersonSchema>;

export default function AddPersonDialog() {
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: { onDynamic: addPersonSchema, onSubmit: addPersonSchema },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const result = await createPerson(value.name);

      if (result.error) {
        form.setFieldMeta("name", (meta) => ({
          ...meta,
          isTouched: true,
          errorMap: {
            ...meta.errorMap,
            onSubmit: { message: result.error },
          },
        }));
        return;
      }

      setOpen(false);
    },
  });

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      variant="dialog"
      title="Add person"
      description="Create a person so transactions can be linked to them."
      trigger={
        <Button variant="outline">
          <PlusIcon /> Add person
        </Button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name="name"
            children={(field) => <field.input label="Name" />}
          />

          <form.AppForm>
            <div className="flex items-center gap-2">
              <form.ResetButton onClick={() => setOpen(false)} />
              <form.SubmitButton label="Add" />
            </div>
          </form.AppForm>
        </FieldGroup>
      </form>
    </AppDialog>
  );
}
