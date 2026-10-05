"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

import { createCategory, updateCategory } from "@/actions/finance";
import { useDialogClose } from "@/components/shared/app-dialog";
import { FieldGroup } from "@/components/ui/field";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppForm } from "@/hooks/use-form";
import { categorySchema } from "@/schemas/category";
import { Category } from "@/types/category";
import { TransactionType } from "@/types/transaction-types";

export default function CategoryForm({
  category,
  onSaved,
}: {
  category?: Category;
  onSaved: () => void;
}) {
  const closeDialog = useDialogClose();
  const router = useRouter();

  const isEditing = !!category;

  const form = useAppForm({
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      type: (category?.type ?? "income") as TransactionType,
      color: category?.color ?? "#3B82F6",
      icon: category?.icon ?? "Tag",
    },
    validators: {
      onDynamic: categorySchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const result = isEditing
        ? await updateCategory(category!.id, value)
        : await createCategory(value);

      if (!result.success) {
        return;
      }

      onSaved();
      closeDialog();
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.AppField
          name="name"
          children={(field) => (
            <field.input label="Name" maxLength={60} autoFocus />
          )}
        />

        <form.AppField
          name="description"
          children={(field) => (
            <field.textarea label="Description" maxLength={240} rows={3} />
          )}
        />

        <form.AppField
          name="type"
          children={(field) => (
            <field.toggleGroup
              label="Transaction type"
              multiple={false}
              spacing={0}
            >
              <ToggleGroupItem value="income">Income</ToggleGroupItem>
              <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
            </field.toggleGroup>
          )}
        />

        <form.AppField
          name="color"
          children={(field) => <field.color label="Color" />}
        />

        <form.AppField
          name="icon"
          children={(field) => <field.icon label="Icon" />}
        />

        <form.AppForm>
          <div className="flex items-center gap-2">
            <form.ResetButton onClick={closeDialog} />
            <form.SubmitButton label={isEditing ? "Save changes" : "Create"} />
          </div>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
