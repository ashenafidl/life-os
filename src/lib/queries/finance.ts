import {
  isNotNull,
  desc,
  sql,
  and,
  gte,
  lt,
  eq,
  count,
  SQL,
  gt,
  ilike,
} from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  smsMessages,
  transactions,
} from "@/db/schema/finance";
import { FilterCondition } from "@/lib/filters";
import withPagination, { PaginatedResult } from "@/lib/with-pagination";
import { MatchedField, TransactionReview } from "@/types/transaction-review";

export const getBanks = cache(async () => {
  return await db.select().from(banks);
});

export const getBankBalances = cache(async () => {
  // "Latest transaction per bank, but only among ones where we actually
  // captured a balance" — a transaction whose regex didn't capture
  // balanceAfter shouldn't count as "the latest known balance."
  const latestPerBank = await db
    .selectDistinctOn([transactions.bankId], {
      bankId: transactions.bankId,
      balanceAfter: transactions.balanceAfter,
      occurredAt: transactions.occurredAt,
    })
    .from(transactions)
    .where(isNotNull(transactions.balanceAfter))
    .orderBy(transactions.bankId, desc(transactions.occurredAt));

  const allBanks = await db.select().from(banks);

  const balances = allBanks.map((bank) => {
    const latest = latestPerBank.find((t) => t.bankId === bank.id);
    return {
      bankId: bank.id,
      bankName: bank.name,
      balance: latest ? Number(latest.balanceAfter) : null, // null = no known balance yet
      asOf: latest?.occurredAt ?? null,
    };
  });

  const total = balances.reduce((sum, b) => sum + (b.balance ?? 0), 0);

  return { balances, total };
});

export const getDailyTotals = cache(
  async (from: Date, to: Date): Promise<Record<string, number>> => {
    const rows = await db
      .select({
        day: sql<string>`to_char(${transactions.occurredAt}, 'YYYY-MM-DD')`,
        net: sql<string>`sum(
        case when ${transactions.type} = 'income'
          then ${transactions.amount}
          else -${transactions.amount}
        end
      )`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.occurredAt, from),
          lt(transactions.occurredAt, to),
        ),
      )
      .groupBy(sql`1`);

    return Object.fromEntries(rows.map((r) => [r.day, Number(r.net)]));
  },
);

export const getMessages = cache(async () => {
  return await db.select().from(smsMessages).orderBy(desc(smsMessages.date));
});

// Mirrors the field types in lib/filters.ts — kept separate since the query
// layer only needs field->column mapping, not the UI's runtime bank options.
const FIELD_TYPES: Record<string, "text" | "number" | "select" | "date"> = {
  bankId: "select",
  type: "select",
  amount: "number",
  occurredAt: "date",
  recipientName: "text",
  senderName: "text",
};

const FILTER_COLUMNS = {
  bankId: transactions.bankId,
  type: transactions.type,
  amount: transactions.totalAmount,
  occurredAt: transactions.occurredAt,
  recipientName: transactions.recipientName,
  senderName: transactions.senderName,
};

const conditionToSql = (condition: FilterCondition): SQL | undefined => {
  const column = FILTER_COLUMNS[condition.field as keyof typeof FILTER_COLUMNS];
  if (!column || !condition.value) return undefined; // unknown field or empty value — don't filter on nothing

  const fieldType = FIELD_TYPES[condition.field];

  // condition.value is always a plain string at runtime (comes from a form
  // input/Select), so it can't statically match a pgEnum's literal union or
  // a timestamp column's Date type — the `as any` casts below are that
  // runtime-vs-compile-time gap, not a sign the values are actually unsafe.
  if (fieldType === "date") {
    const date = new Date(condition.value);
    if (condition.operator === "before") return lt(column, date as never);
    if (condition.operator === "after") return gt(column, date as never);
    return eq(column, date as never);
  }

  switch (condition.operator) {
    case "contains":
      return fieldType === "text"
        ? ilike(column, `%${condition.value}%`)
        : eq(column, condition.value as never);
    case "gt":
      return gt(column, condition.value as never);
    case "lt":
      return lt(column, condition.value as never);
    default: // "equals"
      return eq(column, condition.value as never);
  }
};

const buildTransactionFilterWhere = (filters: FilterCondition[]) => {
  const clauses = filters
    .map(conditionToSql)
    .filter((c): c is SQL => c !== undefined);
  return clauses.length > 0 ? and(...clauses) : undefined;
};

export const getTransactionReview = cache(
  async (opts: {
    page: number;
    pageSize: number;
    filters: FilterCondition[];
  }): Promise<PaginatedResult<TransactionReview>> => {
    const where = buildTransactionFilterWhere(opts.filters);

    const query = db
      .select({
        transaction: transactions,
        bankName: banks.name,
        body: smsMessages.body,
        pattern: bankPatterns,
      })
      .from(transactions)
      .innerJoin(smsMessages, eq(transactions.smsMessageId, smsMessages.id))
      .innerJoin(bankPatterns, eq(transactions.patternId, bankPatterns.id))
      .innerJoin(banks, eq(transactions.bankId, banks.id))
      .where(where)
      .orderBy(desc(transactions.occurredAt));

    const rows = await withPagination(
      query.$dynamic(),
      opts.page,
      opts.pageSize,
    );

    // Count query
    const [{ count: totalItems }] = await db
      .select({ count: count() })
      .from(transactions)
      .innerJoin(smsMessages, eq(transactions.smsMessageId, smsMessages.id))
      .innerJoin(bankPatterns, eq(transactions.patternId, bankPatterns.id))
      .innerJoin(banks, eq(transactions.bankId, banks.id))
      .where(where);

    const totalPages = Math.max(1, Math.ceil(totalItems / opts.pageSize));
    const hasNextPage = opts.page < totalPages;
    const hasPreviousPage = opts.page > 1;

    const data = rows.map((row) => {
      const fields: MatchedField[] = [];

      try {
        const regex = new RegExp(row.pattern.regex, "id");
        const match = regex.exec(row.body);

        if (match?.indices?.groups) {
          for (const [name, range] of Object.entries(match.indices.groups)) {
            if (!range) continue;
            const [start, end] = range;
            fields.push({
              name,
              value: row.body.slice(start, end),
              start,
              end,
            });
          }
        }
      } catch {
        // malformed pattern — fall through with no highlighted fields,
        // the raw body still renders plain in the viewer
      }

      fields.sort((a, b) => a.start - b.start);

      return {
        transaction: row.transaction,
        bankName: row.bankName,
        body: row.body,
        fields,
        pattern: row.pattern,
      };
    });

    return {
      data,
      meta: {
        page: opts.page,
        pageSize: opts.pageSize,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  },
);
