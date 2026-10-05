"use server";

import { and, asc, count, eq, inArray, ne } from "drizzle-orm";
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
import { categorySchema, CategoryInput } from "@/schemas/category";
import { TransactionType } from "@/types/transaction-types";

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

export async function updateTransactionCategories(
  transactionId: string,
  categoryIds: string[],
): Promise<ActionResult<{ transactionId: string }>> {
  return runAction(async () => {
    const uniqueCategoryIds = [...new Set(categoryIds.filter(Boolean))];

    await db.transaction(async (tx) => {
      const [transaction] = await tx
        .select({ type: transactions.type })
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (uniqueCategoryIds.length > 0) {
        const matchingCategories = await tx
          .select({ id: categories.id, type: categories.type })
          .from(categories)
          .where(inArray(categories.id, uniqueCategoryIds));

        if (matchingCategories.length !== uniqueCategoryIds.length) {
          throw new ActionError("One or more categories no longer exist.");
        }

        if (
          matchingCategories.some(
            (category) => category.type !== transaction.type,
          )
        ) {
          throw new ActionError("Categories must match the transaction type.");
        }
      }

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
    return { transactionId };
  });
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
    const uniqueCategoryIds = [...new Set(data.categoryIds.filter(Boolean))];

    if (uniqueCategoryIds.length > 0) {
      const matchingCategories = await db
        .select({ id: categories.id, type: categories.type })
        .from(categories)
        .where(inArray(categories.id, uniqueCategoryIds));

      if (matchingCategories.length !== uniqueCategoryIds.length) {
        throw new ActionError("One or more categories no longer exist.");
      }

      if (matchingCategories.some((category) => category.type !== type)) {
        throw new ActionError("Categories must match the transaction type.");
      }
    }

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

export async function createCategory(
  data: CategoryInput,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      throw new ActionError(
        parsed.error.issues[0]?.message ?? "Invalid category.",
      );
    }

    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.name, parsed.data.name),
          eq(categories.type, parsed.data.type),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ActionError(
        "A category with this name and type already exists.",
      );
    }

    const [created] = await db
      .insert(categories)
      .values({ ...parsed.data, description: parsed.data.description })
      .returning({ id: categories.id });

    revalidatePath("/finance/categories");
    revalidatePath("/finance/transactions");
    return { id: created.id };
  });
}

export async function updateCategory(
  categoryId: string,
  data: CategoryInput,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      throw new ActionError(
        parsed.error.issues[0]?.message ?? "Invalid category.",
      );
    }

    const [existing] = await db
      .select({ type: categories.type })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existing) {
      throw new ActionError("Category not found.");
    }

    if (existing.type !== parsed.data.type) {
      const [usage] = await db
        .select({ count: count() })
        .from(transactionCategories)
        .where(eq(transactionCategories.categoryId, categoryId));

      if (usage.count > 0) {
        throw new ActionError(
          "A category's type cannot change while transactions use it.",
        );
      }
    }

    const [duplicate] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.name, parsed.data.name),
          eq(categories.type, parsed.data.type),
          ne(categories.id, categoryId),
        ),
      )
      .limit(1);

    if (duplicate) {
      throw new ActionError(
        "A category with this name and type already exists.",
      );
    }

    const [updated] = await db
      .update(categories)
      .set({ ...parsed.data, description: parsed.data.description || null })
      .where(eq(categories.id, categoryId))
      .returning({ id: categories.id });

    revalidatePath("/finance/categories");
    revalidatePath("/finance/transactions");
    return { id: updated.id };
  });
}

export async function deleteCategory(
  categoryId: string,
): Promise<ActionResult<{ deletedId: string }>> {
  return runAction(async () => {
    const [category] = await db
      .select({ isDefault: categories.isDefault })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category) {
      throw new ActionError("Category not found.");
    }

    if (category.isDefault) {
      throw new ActionError("Default categories cannot be deleted.");
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath("/finance/categories");
    revalidatePath("/finance/transactions");
    return { deletedId: categoryId };
  });
}

export async function getCategories(type?: TransactionType) {
  if (type) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.type, type))
      .orderBy(asc(categories.name));
  }

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
