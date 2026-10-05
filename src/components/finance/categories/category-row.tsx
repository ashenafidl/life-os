"use client";

import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteCategory } from "@/actions/finance";
import CategoryEditorDialog from "@/components/finance/categories/category-editor-dialog";
import AppDialog from "@/components/shared/app-dialog";
import DynamicIcon from "@/components/shared/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";

export default function CategoryRow({
  category,
  transactionCount,
}: {
  category: Category;
  transactionCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex min-h-18 items-center gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-md"
        style={{
          backgroundColor: `${category.color}20`,
          color: category.color,
        }}
      >
        <DynamicIcon name={category.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{category.name}</p>
          {category.isDefault && (
            <span className="text-muted-foreground text-xs">Default</span>
          )}
        </div>
        <p className="text-muted-foreground truncate text-sm">
          {category.description || "No description"}
        </p>
      </div>
      <span className="text-muted-foreground hidden text-xs sm:block">
        {transactionCount}{" "}
        {transactionCount === 1 ? "transaction" : "transactions"}
      </span>
      <CategoryEditorDialog
        category={category}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${category.name}`}
            title={`Edit ${category.name}`}
          >
            <PencilSimpleIcon />
          </Button>
        }
      />
      {!category.isDefault && (
        <AppDialog
          variant="alert"
          title={`Delete ${category.name}?`}
          description={
            transactionCount > 0
              ? `This removes the category from ${transactionCount} ${transactionCount === 1 ? "transaction" : "transactions"}.`
              : "This category is not linked to any transactions."
          }
          confirmLabel={isPending ? "Deleting…" : "Delete"}
          confirmVariant="destructive"
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${category.name}`}
              title={`Delete ${category.name}`}
              disabled={isPending}
            >
              <TrashIcon />
            </Button>
          }
          onConfirm={() => {
            startTransition(async () => {
              const result = await deleteCategory(category.id);
              if (!result.success) {
                return;
              }
              router.refresh();
            });
          }}
        />
      )}
    </div>
  );
}
