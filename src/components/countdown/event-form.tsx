"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { addYears, endOfMonth, startOfDay } from "date-fns";

import { createEvent, updateEvent } from "@/actions/countdown";
import { useDialogClose } from "@/components/shared/app-dialog";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/hooks/use-form";
import { eventInsertSchema } from "@/schemas/countdown";

export default function EventForm({
  event,
}: {
  event?: { id: string; title: string; date: Date | string };
}) {
  const closeDialog = useDialogClose();
  const isEditing = Boolean(event?.id);

  const today = new Date();

  const form = useAppForm({
    defaultValues: {
      title: event?.title ?? "",
      date: event ? new Date(event.date) : today,
    },
    validators: {
      onDynamic: eventInsertSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      if (isEditing) {
        if (!event) {
          return;
        }

        const result = await updateEvent(event.id, value);

        if (!result.success) {
          return;
        }

        closeDialog();
        return;
      }

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
          children={(field) => (
            <field.date
              label="Date"
              startMonth={today}
              endMonth={endOfMonth(addYears(today, 10))}
              disabled={{ before: startOfDay(today) }}
            />
          )}
        />

        <form.AppForm>
          <div className="flex items-center gap-2">
            <form.ResetButton onClick={closeDialog} />
            <form.SubmitButton label={isEditing ? "Save changes" : undefined} />
          </div>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
