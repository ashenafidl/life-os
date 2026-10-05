"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import CategoryEditorDialog from "@/components/finance/categories/category-editor-dialog";
import CategoryRow from "@/components/finance/categories/category-row";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CategoryWithUsage } from "@/types/category";
import { TransactionType } from "@/types/transaction-types";

export default function CategoryList({
  categories,
}: {
  categories: CategoryWithUsage[];
}) {
  const [type, setType] = useState<TransactionType>("income");

  const visibleCategories = categories.filter(
    ({ category }) => category.type === type,
  );

  return (
    <section className="space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {categories.length} categories
          </p>
        </div>
        <CategoryEditorDialog
          trigger={
            <Button>
              <PlusIcon /> Add category
            </Button>
          }
        />
      </header>

      <ToggleGroup
        multiple={false}
        variant="outline"
        size="sm"
        spacing={0}
        autoFocus={false}
        value={[type]}
        onValueChange={(values) => {
          if (values[0]) setType(values[0] as TransactionType);
        }}
      >
        <ToggleGroupItem value="income">Income</ToggleGroupItem>
        <ToggleGroupItem value="expense">Expenses</ToggleGroupItem>
      </ToggleGroup>

      <div className="divide-y">
        {visibleCategories.length > 0 ? (
          visibleCategories.map(({ category, transactionCount }) => (
            <CategoryRow
              key={category.id}
              category={category}
              transactionCount={transactionCount}
            />
          ))
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No {type} categories yet.
          </p>
        )}
      </div>
    </section>
  );
}
