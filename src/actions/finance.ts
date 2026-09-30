"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import {
  categories,
  peoples,
  personAliases,
  smsMessages,
  transactionCategories,
  transactionPeople,
  transactions,
} from "@/db/schema/finance";
import { ActionError, ActionResult, runAction } from "@/lib/action-result";
import { counterpartyName } from "@/lib/name-matching";
import { runAutoMatching } from "@/lib/peoples-matcher";
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

interface CreatePersonResponse {
  person?: typeof peoples.$inferSelect;
  existing: boolean;
  error?: string;
}

export async function createPerson(
  name: string,
): Promise<CreatePersonResponse> {
  const [existingPerson] = await db
    .select()
    .from(peoples)
    .where(eq(peoples.name, name))
    .limit(1);

  if (existingPerson) {
    return {
      person: existingPerson,
      existing: true,
      error: "A person with this name already exists.",
    };
  }

  const [createdPerson] = await db.insert(peoples).values({ name }).returning();

  revalidatePath("/finance/peoples");

  return { person: createdPerson, existing: false };
}

export async function linkPersonToTransaction(
  transactionId: string,
  personId: string,
) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  const capturedName = transaction ? counterpartyName(transaction) : null;

  await db.transaction(async (tx) => {
    await tx
      .delete(transactionPeople)
      .where(eq(transactionPeople.transactionId, transactionId));

    await tx
      .insert(transactionPeople)
      .values({ transactionId, personId, source: "manual" });

    if (capturedName && capturedName.trim()) {
      await tx
        .insert(personAliases)
        .values({ personId, alias: capturedName.trim() })
        .onConflictDoNothing();
    }
  });

  revalidatePath("/finance/transactions");
  revalidatePath("/finance/peoples");
}

export async function unlinkPersonFromTransaction(transactionId: string) {
  await db
    .delete(transactionPeople)
    .where(eq(transactionPeople.transactionId, transactionId));
  revalidatePath("/finance/transactions");
  revalidatePath("/finance/peoples");
}

export async function rerunPeopleMatching() {
  const result = await runAutoMatching();
  revalidatePath("/finance/peoples");
  revalidatePath("/finance/transactions");
  return result;
}

export async function updatePerson(personId: string, name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) return null;

  const [updatedPerson] = await db
    .update(peoples)
    .set({ name: trimmedName })
    .where(eq(peoples.id, personId))
    .returning();

  revalidatePath("/finance/peoples");
  return updatedPerson ?? null;
}

export async function deletePerson(personId: string) {
  await db.delete(peoples).where(eq(peoples.id, personId));
  revalidatePath("/finance/peoples");
}

export async function addPersonAlias(personId: string, alias: string) {
  const trimmedAlias = alias.trim();
  if (!trimmedAlias) return null;

  const [createdAlias] = await db
    .insert(personAliases)
    .values({ personId, alias: trimmedAlias })
    .onConflictDoNothing()
    .returning();

  revalidatePath("/finance/peoples");
  return createdAlias ?? null;
}

export async function removePersonAlias(aliasId: string) {
  await db.delete(personAliases).where(eq(personAliases.id, aliasId));
  revalidatePath("/finance/peoples");
}

export async function autoLinkTransaction(
  transactionId: string,
  personId: string,
) {
  await db
    .insert(transactionPeople)
    .values({ transactionId, personId, source: "auto" })
    .onConflictDoNothing();
}
