"use client";

import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { revalidateLogic } from "@tanstack/react-form";
import { useHotkey } from "@tanstack/react-hotkeys";
import { startOfDay } from "date-fns";
import { useEffect, useState } from "react";

import { createCashTransaction, getCategories } from "@/actions/finance";
import CategoryBadge from "@/components/finance/categories/category-badge";
import AppDialog from "@/components/shared/app-dialog";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppForm } from "@/hooks/use-form";
import { cashTnxSchema } from "@/schemas/cash-transaction";
import { Category } from "@/types/category";
import { TransactionType } from "@/types/transaction-types";

export default function AddTransactionDialog() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<TransactionType>("expense");
  const [open, setOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useHotkey("Q", () => setOpen(true), {
    meta: {
      name: "Add transaction",
      description: "Open add transaction dialog",
      group: "Finance",
    },
  });

  const form = useAppForm({
    defaultValues: {
      amount: "",
      occurredAt: new Date(),
      type: "expense" as TransactionType,
    },
    validators: {
      onDynamic: cashTnxSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const result = await createCashTransaction({
        amount: value.amount,
        occurredAt: value.occurredAt,
        type: value.type,
        categoryIds: selectedCategories,
      });

      if (result.success) {
        setOpen(false);
        form.reset();
        setSelectedCategories([]);
        setCategory("expense");
      }
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    getCategories(category).then((nextCategories) => {
      if (!cancelled) {
        setAllCategories(nextCategories);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [category, open]);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      variant="dialog"
      title="Add transaction"
      description="Manually record a transaction for cash balance."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name="type"
            children={(field) => (
              <ToggleGroup
                multiple={false}
                variant="outline"
                size="sm"
                spacing={0}
                autoFocus={false}
                value={[field.state.value]}
                onValueChange={(groupValues) => {
                  if (groupValues[0]) {
                    const nextType = groupValues[0] as TransactionType;
                    field.handleChange(nextType);
                    setCategory(nextType);
                    setSelectedCategories([]);
                  }
                }}
              >
                <ToggleGroupItem value="income" className="gap-2">
                  <TrendUpIcon color="var(--color-green-500)" size={8} /> Income
                </ToggleGroupItem>
                <ToggleGroupItem value="expense" className="gap-2">
                  <TrendDownIcon color="var(--destructive)" size={8} /> Expense
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          />

          <form.AppField
            name="amount"
            children={(field) => (
              <field.input
                label="Amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                autoFocus
              />
            )}
          />

          <form.AppField
            name="occurredAt"
            children={(field) => (
              <field.date
                label="Date & Time"
                disabled={{ after: startOfDay(new Date()) }}
                showTime
              />
            )}
          />

          <div className="space-y-2">
            <Label>Category</Label>
            <ToggleGroup
              multiple
              variant="outline"
              className="flex flex-wrap"
              onValueChange={(groupValue) => setSelectedCategories(groupValue)}
            >
              {allCategories.map((category) => (
                <ToggleGroupItem
                  key={category.id}
                  size="sm"
                  value={category.id}
                >
                  <CategoryBadge {...category} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

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
