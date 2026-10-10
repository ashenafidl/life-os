import { categories } from "@/db/schema/finance";

export const DEFAULT_CATEGORIES: Omit<
  typeof categories.$inferInsert,
  "isDefault"
>[] = [
  // Income
  {
    name: "Salary",
    description: "Pay and employment income",
    type: "income",
    color: "#22C55E",
    icon: "CurrencyDollar",
  },
  {
    name: "Gift Received",
    description: "Money received as a gift",
    type: "income",
    color: "#F59E0B",
    icon: "Gift",
  },
  {
    name: "Per Diem",
    description: "Travel and work allowances",
    type: "income",
    color: "#14B8A6",
    icon: "SuitcaseRolling",
  },
  {
    name: "Self",
    description: "Transfers between your own accounts",
    type: "income",
    color: "#64748B",
    icon: "ArrowsLeftRight",
  },

  // Expense
  {
    name: "Transport",
    description: "Public transport and rides",
    type: "expense",
    color: "#3B82F6",
    icon: "Bus",
  },
  {
    name: "Airtime & Data",
    description: "Mobile airtime and data bundles",
    type: "expense",
    color: "#06B6D4",
    icon: "DeviceMobile",
  },
  {
    name: "Gift Sent",
    description: "Money or presents given to others",
    type: "expense",
    color: "#EC4899",
    icon: "HandHeart",
  },
  {
    name: "Groceries",
    description: "Supermarket and household food shopping",
    type: "expense",
    color: "#84CC16",
    icon: "ShoppingCart",
  },
  {
    name: "Food & Drinks",
    description: "Snacks, coffee, and beverages",
    type: "expense",
    color: "#F97316",
    icon: "Coffee",
  },
  {
    name: "Eating Out",
    description: "Restaurants, cafes, and takeaway meals",
    type: "expense",
    color: "#EF4444",
    icon: "ForkKnife",
  },
  {
    name: "Clothing",
    description: "Clothes, shoes, and accessories",
    type: "expense",
    color: "#8B5CF6",
    icon: "TShirt",
  },
  {
    name: "Household",
    description: "Remodeling, repairs, and maintenance",
    type: "expense",
    color: "#CA8A04",
    icon: "Hammer",
  },
  {
    name: "Beauty",
    description: "Salon, barber, and personal grooming",
    type: "expense",
    color: "#D946EF",
    icon: "Scissors",
  },
  {
    name: "Self",
    description: "Transfers between your own accounts",
    type: "expense",
    color: "#64748B",
    icon: "ArrowsLeftRight",
  },
];
