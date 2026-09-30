import { eq, isNull } from "drizzle-orm";

import { autoLinkTransaction } from "@/actions/finance";
import { db } from "@/db/drizzle";
import { transactionPeople, transactions } from "@/db/schema/finance";
import { counterpartyName, decidePersonMatch } from "@/lib/name-matching";
import { loadPeopleWithAliases } from "@/lib/queries/finance";

export type MatchSource = "auto" | "manual";

/** Re-runnable matching pass over every transaction that has a captured
 * counterparty name but no person link yet. Kept separate from parsing so it
 * can run again as aliases improve, mirroring reparseUnmatched. */
export async function runAutoMatching(): Promise<{
  matched: number;
  ambiguous: number;
  skipped: number;
}> {
  const [allPeople, unlinked] = await Promise.all([
    loadPeopleWithAliases(),
    db
      .select({ transaction: transactions })
      .from(transactions)
      .leftJoin(
        transactionPeople,
        eq(transactionPeople.transactionId, transactions.id),
      )
      .where(isNull(transactionPeople.transactionId)),
  ]);

  let matched = 0;
  let ambiguous = 0;
  let skipped = 0;

  for (const { transaction } of unlinked) {
    const name = counterpartyName(transaction);
    if (!name) {
      skipped++;
      continue;
    }

    const decision = decidePersonMatch(name, allPeople);
    if (decision.status === "matched") {
      await autoLinkTransaction(transaction.id, decision.personId);
      matched++;
    } else if (decision.status === "ambiguous") {
      ambiguous++;
    } else {
      skipped++;
    }
  }

  return { matched, ambiguous, skipped };
}

/** Matches a single freshly parsed transaction (used by the parse loop). */
export async function autoMatchTransaction(transactionId: string) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  if (!transaction) return;

  const name = counterpartyName(transaction);
  if (!name) return;

  const allPeople = await loadPeopleWithAliases();
  const decision = decidePersonMatch(name, allPeople);

  if (decision.status === "matched") {
    await autoLinkTransaction(transactionId, decision.personId);
  }
}
