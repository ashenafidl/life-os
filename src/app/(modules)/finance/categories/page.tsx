import CategoryList from "@/components/finance/categories/category-list";
import { getCategoriesWithUsage } from "@/lib/queries/finance";

export default async function CategoriesPage() {
  const categories = await getCategoriesWithUsage();

  return <CategoryList categories={categories} />;
}
