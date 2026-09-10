"use client";

import {
  PlusIcon,
  TrendDownIcon,
  TrendUpIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState, useTransition } from "react";

import { updateTransactionCategories } from "@/actions/finance";
import FieldList from "@/components/finance/field-list";
import HighlightedBody from "@/components/finance/highlighted-body";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/db/schema/finance";
import { TransactionReview } from "@/types/transaction-review";

interface Props {
  review: TransactionReview;
  categories: (typeof categories.$inferSelect)[];
}

export default function SmsMatchViewer({ review, categories }: Props) {
  const [active, setActive] = useState<string>();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() =>
    review.categories.map((category) => category.id),
  );
  const [_, startTransition] = useTransition();

  const selectedCategories = categories.filter((category) =>
    selectedCategoryIds.includes(category.id),
  );
  const remainingCategories = categories.filter(
    (category) => !selectedCategoryIds.includes(category.id),
  );

  const persistSelection = (nextSelectedCategoryIds: string[]) => {
    setSelectedCategoryIds(nextSelectedCategoryIds);

    startTransition(async () => {
      await updateTransactionCategories(
        review.transaction.id,
        nextSelectedCategoryIds,
      );
    });
  };

  const handleAddCategory = (categoryId: string) => {
    const nextSelectedCategoryIds = [
      ...new Set([...selectedCategoryIds, categoryId]),
    ];

    persistSelection(nextSelectedCategoryIds);
  };

  const handleRemoveCategory = (categoryId: string) => {
    const nextSelectedCategoryIds = selectedCategoryIds.filter(
      (id) => id !== categoryId,
    );

    persistSelection(nextSelectedCategoryIds);
  };

  return (
    <Card className="grid grid-cols-1 gap-4 rounded-none p-4 first:rounded-t-xl last:rounded-b-xl md:grid-cols-2">
      <div>
        <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs tracking-wide uppercase">
          <span>
            {review.transaction.type === "income" ? (
              <TrendUpIcon color="var(--color-green-500)" />
            ) : (
              <TrendDownIcon color="var(--destructive)" />
            )}
          </span>
          <span>
            {review.bankName} - {review.pattern.label}
          </span>
        </p>
        <HighlightedBody
          body={review.body}
          fields={review.fields}
          active={active}
          setActive={setActive}
        />

        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
            Categories
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {selectedCategories.length > 0 &&
              selectedCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="rounded-full py-3 pr-0! pl-2"
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                  <Button
                    variant="ghost"
                    aria-label={`Remove ${category.name}`}
                    className="flex size-6 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveCategory(category.id);
                    }}
                  >
                    <XIcon className="size-2.5" />
                  </Button>
                </Badge>
              ))}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="xs">
                    <PlusIcon />
                    Add category
                  </Button>
                }
              />

              <DropdownMenuContent className="w-fit">
                <DropdownMenuGroup>
                  {remainingCategories.map((category) => {
                    return (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => handleAddCategory(category.id)}
                      >
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          Extracted Fields
        </p>
        <FieldList
          transaction={review.transaction}
          active={active}
          setActive={setActive}
        />
      </div>
    </Card>
  );
}
