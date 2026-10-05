import { categories } from "@/db/schema/finance";

export type Category = typeof categories.$inferSelect;

export type CategoryWithUsage = {
  category: Category;
  transactionCount: number;
};
