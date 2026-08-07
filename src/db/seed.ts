// oxlint-disable no-console
import { seedData } from "@/constants/seed-data";
import { db } from "@/db/drizzle";
import { bankPatterns, banks } from "@/db/schema/finance";
import "dotenv/config";

async function seed() {
  for (const item of seedData) {
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
            set: { regex: pattern.regex, type: pattern.type },
          });
      }
    }
  }

  console.log(`Seeded ${seedData.length} bank(s).`);
}

seed().catch((error) => console.error("Seed failed:", error));
