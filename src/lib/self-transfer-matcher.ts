import { and, eq, gte, inArray, lte, ne, or } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  categories,
  transactionCategories,
  transactionLinks,
  transactions,
} from "@/db/schema/finance";

const MATCH_WINDOW_MS = 5 * 60 * 1000;
type Transaction = typeof transactions.$inferSelect;

function accountMatchScore(outgoing: Transaction, incoming: Transaction) {
  let score = 0;

  const normalized = (value: string | null) => value?.trim().toLowerCase();

  const outgoingRecipient = normalized(outgoing.recipientAccount);
  const incomingSender = normalized(incoming.senderAccount);

  const incomingRecipient = normalized(incoming.recipientAccount);
  const outgoingSender = normalized(outgoing.senderAccount);

  if (
    (outgoingRecipient && outgoingRecipient === incomingSender) ||
    (outgoingSender && outgoingSender === incomingRecipient)
  ) {
    score += 2;
  }

  const outgoingName = normalized(outgoing.recipientName);
  const incomingName = normalized(incoming.senderName);
  if (outgoingName && outgoingName === incomingName) score++;

  return score;
}

function rankCandidates(
  outgoing: Transaction,
  incomingCandidates: Transaction[],
) {
  const ranked = incomingCandidates.map((transaction) => ({
    transaction,
    score: accountMatchScore(outgoing, transaction),
  }));
  const highestScore = Math.max(...ranked.map(({ score }) => score), 0);
  const best = ranked.filter(({ score }) => score === highestScore);

  return best.length === 1 ? best[0].transaction : null;
}

function rankOutgoingCandidates(
  incoming: Transaction,
  outgoingCandidates: Transaction[],
) {
  const ranked = outgoingCandidates.map((transaction) => ({
    transaction,
    score: accountMatchScore(transaction, incoming),
  }));
  const highestScore = Math.max(...ranked.map(({ score }) => score), 0);
  const best = ranked.filter(({ score }) => score === highestScore);

  return best.length === 1 ? best[0].transaction : null;
}

async function getEligibleCandidates(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  transaction: Transaction,
): Promise<Transaction[]> {
  if (!transaction.type || !transaction.occurredAt) return [];

  const otherType = transaction.type === "expense" ? "income" : "expense";
  const candidates = await tx
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.accountType, "bank"),
        eq(transactions.type, otherType),
        eq(transactions.amount, transaction.amount),
        gte(
          transactions.occurredAt,
          new Date(transaction.occurredAt.getTime() - MATCH_WINDOW_MS),
        ),
        lte(
          transactions.occurredAt,
          new Date(transaction.occurredAt.getTime() + MATCH_WINDOW_MS),
        ),
        ne(transactions.id, transaction.id),
      ),
    );

  if (candidates.length === 0) return [];

  const candidateIds = candidates.map(({ id }) => id);
  const links = await tx
    .select()
    .from(transactionLinks)
    .where(
      or(
        inArray(transactionLinks.transactionId, candidateIds),
        inArray(transactionLinks.linkedTransactionId, candidateIds),
      ),
    );

  const linkedIds = new Set(
    links.flatMap(({ transactionId, linkedTransactionId }) => [
      transactionId,
      linkedTransactionId,
    ]),
  );

  return candidates.filter((candidate) => !linkedIds.has(candidate.id));
}

async function getSelfCategoryId(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  type: "income" | "expense",
) {
  const [category] = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.name, "Self"), eq(categories.type, type)))
    .limit(1);

  if (!category) {
    throw new Error('The default "Self" categories are not seeded.');
  }

  return category.id;
}

export async function autoMatchSelfTransfer(transactionId: string) {
  await db.transaction(async (tx) => {
    const [transaction] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (
      !transaction ||
      transaction.accountType !== "bank" ||
      !transaction.type ||
      !transaction.occurredAt
    ) {
      return;
    }

    const [existingLink] = await tx
      .select({ id: transactionLinks.id })
      .from(transactionLinks)
      .where(
        or(
          eq(transactionLinks.transactionId, transactionId),
          eq(transactionLinks.linkedTransactionId, transactionId),
        ),
      )
      .limit(1);
    if (existingLink) return;

    const candidates = await getEligibleCandidates(tx, transaction);
    if (candidates.length === 0) return;

    const outgoing =
      transaction.type === "expense"
        ? transaction
        : rankOutgoingCandidates(transaction, candidates);
    if (!outgoing) return;

    const incomingCandidates = await getEligibleCandidates(tx, outgoing);
    const incoming = rankCandidates(outgoing, incomingCandidates);
    if (!incoming) return;

    const outgoingCandidates = await getEligibleCandidates(tx, incoming);
    if (
      rankOutgoingCandidates(incoming, outgoingCandidates)?.id !== outgoing.id
    )
      return;

    const [outgoingSelfCategoryId, incomingSelfCategoryId] = await Promise.all([
      getSelfCategoryId(tx, "expense"),
      getSelfCategoryId(tx, "income"),
    ]);

    await tx
      .delete(transactionCategories)
      .where(
        inArray(transactionCategories.transactionId, [
          outgoing.id,
          incoming.id,
        ]),
      );

    await tx.insert(transactionCategories).values([
      { transactionId: outgoing.id, categoryId: outgoingSelfCategoryId },
      { transactionId: incoming.id, categoryId: incomingSelfCategoryId },
    ]);

    await tx.insert(transactionLinks).values({
      transactionId: outgoing.id,
      linkedTransactionId: incoming.id,
      type: "self_transfer",
    });
  });
}
