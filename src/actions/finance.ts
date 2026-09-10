"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import {
  categories,
  smsMessages,
  transactionCategories,
} from "@/db/schema/finance";
import { parseMessages } from "@/lib/sms-parser";

export async function deleteAllUnmatched() {
  await db.delete(smsMessages).where(and(eq(smsMessages.status, "unmatched")));
  revalidatePath("/finance/inbox");
}

export async function parseAllMessages(scope: "all" | "unmatched") {
  const whereClause =
    scope === "unmatched" ? eq(smsMessages.status, "unmatched") : undefined;
  const pendingMessages = await db
    .select()
    .from(smsMessages)
    .where(whereClause);

  revalidatePath("/finance/inbox");

  return parseMessages(pendingMessages);
}

export async function createTransactionCategory(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return null;
  }

  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, trimmedName))
    .limit(1);

  if (existingCategory) {
    revalidatePath("/finance/transactions");
    return existingCategory;
  }

  const [createdCategory] = await db
    .insert(categories)
    .values({
      name: trimmedName,
      color: "#6D28D9",
      isDefault: false,
    })
    .returning();

  revalidatePath("/finance/transactions");

  return createdCategory;
}

export async function updateTransactionCategories(
  transactionId: string,
  categoryIds: string[],
) {
  const uniqueCategoryIds = [...new Set(categoryIds.filter(Boolean))];

  await db.transaction(async (tx) => {
    await tx
      .delete(transactionCategories)
      .where(eq(transactionCategories.transactionId, transactionId));

    if (uniqueCategoryIds.length > 0) {
      await tx.insert(transactionCategories).values(
        uniqueCategoryIds.map((categoryId) => ({
          transactionId,
          categoryId,
        })),
      );
    }
  });

  revalidatePath("/finance/transactions");
}
