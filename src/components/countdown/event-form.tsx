"use client";

import { revalidateLogic } from "@tanstack/react-form";

import { createEvent } from "@/actions/countdown";
import { useDialogClose } from "@/components/shared/app-dialog";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/hooks/use-form";
import { eventInsertSchema } from "@/schemas/countdown";

export default function EventForm() {
  const closeDialog = useDialogClose();

  const form = useAppForm({
    defaultValues: {
      title: "",
      date: new Date(),
    },
    validators: {
      onDynamic: eventInsertSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const result = await createEvent(value);

      if (!result.success) {
        return;
      }

      closeDialog();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField
          name="title"
          children={(field) => <field.input label="Title" />}
        />

        <form.AppField
          name="date"
          children={(field) => <field.date label="Date" />}
        />

        <form.AppForm>
          <div className="flex items-center gap-2">
            <form.ResetButton onClick={closeDialog} />
            <form.SubmitButton />
          </div>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
