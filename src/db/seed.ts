// oxlint-disable no-console

import "dotenv/config";
import { bankData } from "@/constants/bank-data";
import { db } from "@/db/drizzle";
import { bankPatterns, banks, categories } from "@/db/schema/finance";

const defaultCategories: Omit<typeof categories.$inferInsert, "isDefault">[] = [
  {
    name: "Salary",
    description: "Pay and employment income",
    type: "income",
    color: "#22C55E",
    icon: "CurrencyDollar",
  },
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
];

async function seedBanksAndPatterns() {
  for (const item of bankData) {
    const [row] = await db
      .insert(banks)
      .values(item.bank)
      .onConflictDoUpdate({
        target: banks.name,
        set: {
          shortCodes: item.bank.shortCodes,
          logoPath: item.bank.logoPath,
          colors: item.bank.colors,
        },
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
        target: [categories.name, categories.type],
        set: {
          description: category.description,
          color: category.color,
          icon: category.icon,
          isDefault: true,
        },
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
