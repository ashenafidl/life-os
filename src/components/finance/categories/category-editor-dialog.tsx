import { useState } from "react";

import CategoryForm from "@/components/finance/categories/category-form";
import AppDialog from "@/components/shared/app-dialog";
import { Category } from "@/types/category";

export default function CategoryEditorDialog({
  category,
  trigger,
}: {
  category?: Category;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={category ? "Edit category" : "Add category"}
      description={category ? "Update category details." : "Create a category."}
      trigger={trigger}
    >
      <CategoryForm
        key={category?.id ?? "new"}
        category={category}
        onSaved={() => {
          setOpen(false);
        }}
      />
    </AppDialog>
  );
}
