// oxlint-disable no-console
import "dotenv/config";
import { bankData } from "@/constants/bank-data";
import { db } from "@/db/drizzle";
import { bankPatterns, banks, categories } from "@/db/schema/finance";

// Icon values are Phosphor icon export names — resolve them to actual
// components via a lookup map in the UI (icon: string -> Icon component),
// since a React component can't be stored in Postgres.
const defaultCategories = [
  { name: "Salary", color: "#22C55E" },
  { name: "Transfer", color: "#64748B" },
  { name: "Transport", color: "#3B82F6" },
  { name: "Airtime & Data", color: "#06B6D4" },
];

async function seedBanksAndPatterns() {
  for (const item of bankData) {
    const [row] = await db
      .insert(banks)
      .values(item.bank)
      .onConflictDoUpdate({
        target: banks.name,
        set: { shortCodes: item.bank.shortCodes },
      })
      .returning();

    if (item.patterns) {
      for (const pattern of item.patterns) {
        await db
          .insert(bankPatterns)
          .values({ bankId: row.id, ...pattern })
          .onConflictDoUpdate({
            target: [bankPatterns.bankId, bankPatterns.label],
            set: {
              regex: pattern.regex,
              type: pattern.type,
              dateFormat: pattern.dateFormat,
              timeFormat: pattern.timeFormat,
            },
          });
      }
    }
  }

  console.log(`Seeded ${bankData.length} bank(s).`);
}

async function seedCategories() {
  for (const category of defaultCategories) {
    await db
      .insert(categories)
      .values({ ...category, isDefault: true })
      .onConflictDoUpdate({
        target: categories.name,
        set: { color: category.color, isDefault: true },
      });
  }

  console.log(`Seeded ${defaultCategories.length} default categories.`);
}

function seed() {
  Promise.all([
    seedBanksAndPatterns().catch((error) =>
      console.error("Seeding bank & patterns failed:", error),
    ),
    seedCategories().catch((error) =>
      console.error("Seeding default categories failed:", error),
    ),
  ]);
}

seed();
