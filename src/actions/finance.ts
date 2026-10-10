"use server";

import { and, asc, count, eq, inArray, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import {
  categories,
  peoples,
  personAliases,
  smsMessages,
  transactionCategories,
  transactionLinks,
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

  const result = await parseMessages(pendingMessages);
  revalidatePath("/finance/transactions");
  revalidatePath("/finance/dashboard");
  return result;
}

export async function updateTransactionCategories(
  transactionId: string,
  categoryIds: string[],
): Promise<
  ActionResult<{
    transactionId: string;
    requiresCashWithdrawalChoice: boolean;
  }>
> {
  return runAction(async () => {
    const uniqueCategoryIds = [...new Set(categoryIds.filter(Boolean))];

    const requiresCashWithdrawalChoice = await db.transaction(async (tx) => {
      const [transaction] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (!transaction) {
        throw new ActionError("Transaction not found.");
      }

      if (!transaction.type) {
        throw new ActionError("This transaction has no type.");
      }

      const currentCategoryRows = await tx
        .select({ name: categories.name })
        .from(transactionCategories)
        .innerJoin(
          categories,
          eq(transactionCategories.categoryId, categories.id),
        )
        .where(eq(transactionCategories.transactionId, transactionId));
      const previouslySelf = currentCategoryRows.some(
        ({ name }) => name === "Self",
      );

      let categoriesToApply: Pick<
        typeof categories.$inferSelect,
        "id" | "name"
      >[] = [];
      if (uniqueCategoryIds.length > 0) {
        const matchingCategories = await tx
          .select({
            id: categories.id,
            name: categories.name,
            type: categories.type,
          })
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

        const nonSelfCategories = matchingCategories.filter(
          (category) => category.name !== "Self",
        );
        categoriesToApply =
          nonSelfCategories.length > 0 ? nonSelfCategories : matchingCategories;
      }

      const applyingSelf = categoriesToApply.some(
        (category) => category.name === "Self",
      );
      if (applyingSelf) {
        const [otherLink] = await tx
          .select({ type: transactionLinks.type })
          .from(transactionLinks)
          .where(
            and(
              or(
                eq(transactionLinks.transactionId, transactionId),
                eq(transactionLinks.linkedTransactionId, transactionId),
              ),
              ne(transactionLinks.type, "self_transfer"),
              ne(transactionLinks.type, "cash_withdrawal"),
            ),
          )
          .limit(1);

        if (otherLink) {
          throw new ActionError(
            "A transaction with a refund or cashback link cannot be categorized as Self.",
          );
        }
      }

      await tx
        .delete(transactionCategories)
        .where(eq(transactionCategories.transactionId, transactionId));

      if (categoriesToApply.length > 0) {
        await tx.insert(transactionCategories).values(
          categoriesToApply.map(({ id: categoryId }) => ({
            transactionId,
            categoryId,
          })),
        );
      }

      const appliedSelf = categoriesToApply.some(
        (category) => category.name === "Self",
      );

      if (previouslySelf && !appliedSelf) {
        const [selfLink] = await tx
          .select()
          .from(transactionLinks)
          .where(
            or(
              eq(transactionLinks.transactionId, transactionId),
              eq(transactionLinks.linkedTransactionId, transactionId),
            ),
          )
          .limit(1);

        if (
          selfLink &&
          (selfLink.type === "self_transfer" ||
            selfLink.type === "cash_withdrawal")
        ) {
          const counterpartId =
            selfLink.transactionId === transactionId
              ? selfLink.linkedTransactionId
              : selfLink.transactionId;
          const [counterpart] = await tx
            .select()
            .from(transactions)
            .where(eq(transactions.id, counterpartId))
            .limit(1);

          if (selfLink.type === "cash_withdrawal") {
            if (
              !counterpart ||
              transaction.accountType === "cash" ||
              counterpart.accountType !== "cash"
            ) {
              throw new ActionError(
                "The linked cash withdrawal transaction is invalid.",
              );
            }

            await tx
              .delete(transactions)
              .where(eq(transactions.id, counterpartId));
          } else {
            const counterpartSelfCategoryIds = await tx
              .select({ id: categories.id })
              .from(transactionCategories)
              .innerJoin(
                categories,
                eq(transactionCategories.categoryId, categories.id),
              )
              .where(
                and(
                  eq(transactionCategories.transactionId, counterpartId),
                  eq(categories.name, "Self"),
                ),
              );

            if (counterpartSelfCategoryIds.length > 0) {
              await tx.delete(transactionCategories).where(
                and(
                  eq(transactionCategories.transactionId, counterpartId),
                  inArray(
                    transactionCategories.categoryId,
                    counterpartSelfCategoryIds.map(({ id }) => id),
                  ),
                ),
              );
            }
          }

          await tx
            .delete(transactionLinks)
            .where(eq(transactionLinks.id, selfLink.id));
        }
      }

      const [activeLink] = await tx
        .select({ id: transactionLinks.id })
        .from(transactionLinks)
        .where(
          or(
            eq(transactionLinks.transactionId, transactionId),
            eq(transactionLinks.linkedTransactionId, transactionId),
          ),
        )
        .limit(1);

      return (
        appliedSelf &&
        !previouslySelf &&
        transaction.accountType === "bank" &&
        transaction.type === "expense" &&
        !activeLink
      );
    });

    revalidatePath("/finance/transactions");
    revalidatePath("/finance/dashboard");
    return { transactionId, requiresCashWithdrawalChoice };
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

    const matchingCategories =
      uniqueCategoryIds.length > 0
        ? await db
            .select({
              id: categories.id,
              name: categories.name,
              type: categories.type,
            })
            .from(categories)
            .where(inArray(categories.id, uniqueCategoryIds))
        : [];

    if (matchingCategories.length !== uniqueCategoryIds.length) {
      throw new ActionError("One or more categories no longer exist.");
    }

    if (matchingCategories.some((category) => category.type !== type)) {
      throw new ActionError("Categories must match the transaction type.");
    }

    if (matchingCategories.some((category) => category.name === "Self")) {
      throw new ActionError(
        "Self is only available for linked transfers and withdrawals.",
      );
    }

    const id = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(transactions)
        .values({
          accountType: "cash",
          type,
          amount,
          totalAmount: amount,
          occurredAt,
        })
        .returning({ id: transactions.id });

      if (matchingCategories.length > 0) {
        await tx.insert(transactionCategories).values(
          matchingCategories.map(({ id: categoryId }) => ({
            transactionId: row.id,
            categoryId,
          })),
        );
      }

      return row.id;
    });

    revalidatePath("/finance/dashboard");
    revalidatePath("/finance/transactions");

    return { id };
  });
}

export async function createCashWithdrawal(
  bankTransactionId: string,
): Promise<ActionResult<{ cashTransactionId: string }>> {
  return runAction(async () => {
    const cashTransactionId = await db.transaction(async (tx) => {
      const [bankTransaction] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, bankTransactionId))
        .limit(1);

      if (
        !bankTransaction ||
        bankTransaction.accountType !== "bank" ||
        bankTransaction.type !== "expense" ||
        !bankTransaction.occurredAt ||
        Number(bankTransaction.amount) <= 0
      ) {
        throw new ActionError("This is not a valid bank withdrawal.");
      }

      const [selfCategory] = await tx
        .select({ id: categories.id })
        .from(transactionCategories)
        .innerJoin(
          categories,
          eq(transactionCategories.categoryId, categories.id),
        )
        .where(
          and(
            eq(transactionCategories.transactionId, bankTransactionId),
            eq(categories.name, "Self"),
          ),
        )
        .limit(1);
      if (!selfCategory) {
        throw new ActionError(
          "Categorize this bank transaction as Self first.",
        );
      }

      const [otherCategory] = await tx
        .select({ id: categories.id })
        .from(transactionCategories)
        .innerJoin(
          categories,
          eq(transactionCategories.categoryId, categories.id),
        )
        .where(
          and(
            eq(transactionCategories.transactionId, bankTransactionId),
            ne(categories.name, "Self"),
          ),
        )
        .limit(1);
      if (otherCategory) {
        throw new ActionError(
          "A Self transaction cannot have other categories.",
        );
      }

      const [existingLink] = await tx
        .select({ id: transactionLinks.id })
        .from(transactionLinks)
        .where(
          or(
            eq(transactionLinks.transactionId, bankTransactionId),
            eq(transactionLinks.linkedTransactionId, bankTransactionId),
          ),
        )
        .limit(1);
      if (existingLink) {
        throw new ActionError("This transaction is already linked.");
      }

      const [cashSelfCategory] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.name, "Self"), eq(categories.type, "income")))
        .limit(1);
      if (!cashSelfCategory) {
        throw new ActionError('The default income "Self" category is missing.');
      }

      const [cashTransaction] = await tx
        .insert(transactions)
        .values({
          accountType: "cash",
          type: "income",
          amount: bankTransaction.amount,
          totalAmount: bankTransaction.amount,
          occurredAt: bankTransaction.occurredAt,
        })
        .returning({ id: transactions.id });

      await tx.insert(transactionCategories).values({
        transactionId: cashTransaction.id,
        categoryId: cashSelfCategory.id,
      });
      await tx.insert(transactionLinks).values({
        transactionId: bankTransaction.id,
        linkedTransactionId: cashTransaction.id,
        type: "cash_withdrawal",
      });

      return cashTransaction.id;
    });

    revalidatePath("/finance/dashboard");
    revalidatePath("/finance/transactions");
    return { cashTransactionId };
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

    if (parsed.data.name === "Self") {
      throw new ActionError('"Self" is reserved for built-in categories.');
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
      .select({ name: categories.name, type: categories.type })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existing) {
      throw new ActionError("Category not found.");
    }

    if (
      parsed.data.name === "Self" ||
      (existing.name === "Self" &&
        (parsed.data.name !== "Self" || parsed.data.type !== existing.type))
    ) {
      throw new ActionError('The built-in "Self" category cannot be renamed.');
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
