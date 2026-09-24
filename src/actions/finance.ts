"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import {
  categories,
  smsMessages,
  transactionCategories,
  transactions,
} from "@/db/schema/finance";
import { ActionError, ActionResult, runAction } from "@/lib/action-result";
import { parseMessages } from "@/lib/sms-parser";
import { cashTnxSchema, type CashTnxInput } from "@/schemas/cash-transaction";

interface CashTransactionInput extends CashTnxInput {
  categoryIds: string[];
}

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

export async function createCashTransaction(
  data: CashTransactionInput,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const parsed = cashTnxSchema.safeParse({
      amount: data.amount,
      occurredAt: data.occurredAt,
      type: data.type,
    });

    if (!parsed.success) {
      throw new ActionError(
        parsed.error.issues.map((issue) => issue.message).join("; "),
      );
    }

    const { amount, occurredAt, type } = parsed.data;

    const [row] = await db
      .insert(transactions)
      .values({
        accountType: "cash",
        type,
        amount,
        totalAmount: amount,
        occurredAt,
      })
      .returning({ id: transactions.id });

    const uniqueCategoryIds = [...new Set(data.categoryIds.filter(Boolean))];

    if (uniqueCategoryIds.length > 0) {
      await db.insert(transactionCategories).values(
        uniqueCategoryIds.map((categoryId) => ({
          transactionId: row.id,
          categoryId,
        })),
      );
    }

    revalidatePath("/finance/dashboard");
    revalidatePath("/finance/transactions");

    return { id: row.id };
  });
}

export async function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}
