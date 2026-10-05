import {
  and,
  count,
  desc,
  eq,
  exists,
  gte,
  gt,
  ilike,
  inArray,
  isNotNull,
  lt,
  notExists,
  or,
  SQL,
  sql,
  max,
  asc,
} from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db/drizzle";
import {
  bankPatterns,
  banks,
  categories,
  peoples,
  personAliases,
  smsMessages,
  transactionCategories,
  transactionPeople,
  transactions,
} from "@/db/schema/finance";
import {
  FieldType,
  FilterCondition,
  parseFilterValues,
  UNCATEGORIZED_CATEGORY_VALUE,
  UNLINKED_PERSON_VALUE,
} from "@/lib/filters";
import { PersonWithAliases } from "@/lib/name-matching";
import withPagination, { PaginatedResult } from "@/lib/with-pagination";
import { CashBalance } from "@/types/cash-balance-types";
import { MatchedField, TransactionReview } from "@/types/transaction-review";

export const getBanks = cache(async () => await db.select().from(banks));

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
  const { balance: cashBalance, lastTransactionDate } = await getCashBalance();

  const balances = [
    ...allBanks.map((bank) => {
      const latest = latestPerBank.find((t) => t.bankId === bank.id);
      return {
        bankId: bank.id,
        bankName: bank.name,
        bankLogo: bank.logoPath as string | null,
        bankColors: bank.colors,
        balance: latest ? Number(latest.balanceAfter) : null, // null = no known balance yet
        asOf: latest?.occurredAt ?? null,
      };
    }),
    {
      bankId: "0",
      bankName: "Cash",
      bankLogo: "/image/cash.png",
      bankColors: ["#6f5b21", "#b9a05a"],
      balance: cashBalance,
      asOf: lastTransactionDate,
    },
  ].sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0));

  const total = balances.reduce((sum, b) => sum + (b.balance ?? 0), 0);

  return { balances, total };
});

export const getDailyTotals = cache(
  async (from: Date, to: Date): Promise<Record<string, number>> => {
    const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const rows = await db
      .select({
        day: sql<string>`to_char(${transactions.occurredAt} AT TIME ZONE ${serverTimeZone}, 'YYYY-MM-DD')`,
        net: sql<string>`sum(
        case when ${transactions.type} = 'income'
          then ${transactions.totalAmount}
          else -${transactions.totalAmount}
        end
      )`,
      })
      .from(transactions)
      .leftJoin(smsMessages, eq(transactions.smsMessageId, smsMessages.id))
      .where(
        and(
          or(
            eq(transactions.accountType, "cash"),
            eq(smsMessages.status, "parsed"),
          ),
          gte(transactions.occurredAt, from),
          lt(transactions.occurredAt, to),
        ),
      )
      .groupBy(sql`1`);

    return Object.fromEntries(rows.map((r) => [r.day, Number(r.net)]));
  },
);

export const getMessages = cache(
  async () =>
    await db
      .select({ sms: smsMessages, bank: banks })
      .from(smsMessages)
      .innerJoin(banks, eq(smsMessages.bankId, banks.id))
      .orderBy(desc(smsMessages.date)),
);

// Mirrors the field types in lib/filters.ts — kept separate since the query
// layer only needs field->column mapping, not the UI's runtime bank options.
const FIELD_TYPES: Record<string, FieldType> = {
  bankId: "select",
  type: "select",
  amount: "number",
  occurredAt: "date",
  categoryId: "multi-select",
  personId: "multi-select",
};

const FILTER_COLUMNS = {
  bankId: transactions.bankId,
  type: transactions.type,
  amount: transactions.totalAmount,
  occurredAt: transactions.occurredAt,
  categoryId: transactions.id,
  personId: transactions.id,
};

const conditionToSql = (condition: FilterCondition): SQL | undefined => {
  if (condition.field === "categoryId") {
    const selectedValues = parseFilterValues(condition.value);
    const selectedCategories = selectedValues.filter(
      (value) => value !== UNCATEGORIZED_CATEGORY_VALUE,
    );
    const includeUncategorized = selectedValues.includes(
      UNCATEGORIZED_CATEGORY_VALUE,
    );

    if (selectedCategories.length === 0 && !includeUncategorized) {
      return undefined;
    }

    const categoryMatchClause =
      selectedCategories.length > 0
        ? exists(
            db
              .select()
              .from(transactionCategories)
              .where(
                and(
                  eq(transactionCategories.transactionId, transactions.id),
                  inArray(transactionCategories.categoryId, selectedCategories),
                ),
              ),
          )
        : undefined;

    const uncategorizedClause = includeUncategorized
      ? notExists(
          db
            .select()
            .from(transactionCategories)
            .where(eq(transactionCategories.transactionId, transactions.id)),
        )
      : undefined;

    if (categoryMatchClause && uncategorizedClause) {
      return or(categoryMatchClause, uncategorizedClause);
    }

    return categoryMatchClause ?? uncategorizedClause;
  }

  if (condition.field === "personId") {
    const selectedValues = parseFilterValues(condition.value);
    const selectedPeople = selectedValues.filter(
      (value) => value !== UNLINKED_PERSON_VALUE,
    );
    const includeUnlinked = selectedValues.includes(UNLINKED_PERSON_VALUE);

    if (selectedPeople.length === 0 && !includeUnlinked) {
      return undefined;
    }

    const personMatchClause =
      selectedPeople.length > 0
        ? exists(
            db
              .select()
              .from(transactionPeople)
              .where(
                and(
                  eq(transactionPeople.transactionId, transactions.id),
                  inArray(transactionPeople.personId, selectedPeople),
                ),
              ),
          )
        : undefined;

    const unlinkedClause = includeUnlinked
      ? notExists(
          db
            .select()
            .from(transactionPeople)
            .where(eq(transactionPeople.transactionId, transactions.id)),
        )
      : undefined;

    if (personMatchClause && unlinkedClause) {
      return or(personMatchClause, unlinkedClause);
    }

    return personMatchClause ?? unlinkedClause;
  }

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

    const transactionIds = rows.map((row) => row.transaction.id);

    const linkedCategories =
      transactionIds.length > 0
        ? await db
            .select({
              transactionId: transactionCategories.transactionId,
              category: categories,
            })
            .from(transactionCategories)
            .innerJoin(
              categories,
              eq(transactionCategories.categoryId, categories.id),
            )
            .where(inArray(transactionCategories.transactionId, transactionIds))
        : [];

    const categoryMap = new Map<string, (typeof categories.$inferSelect)[]>();
    for (const row of linkedCategories) {
      const existing = categoryMap.get(row.transactionId) ?? [];
      categoryMap.set(row.transactionId, [...existing, row.category]);
    }

    const linkedPeople =
      transactionIds.length > 0
        ? await db
            .select({
              transactionId: transactionPeople.transactionId,
              person: peoples,
              source: transactionPeople.source,
            })
            .from(transactionPeople)
            .innerJoin(peoples, eq(transactionPeople.personId, peoples.id))
            .where(inArray(transactionPeople.transactionId, transactionIds))
        : [];

    const peopleMap = new Map<
      string,
      {
        person: typeof peoples.$inferSelect;
        source: (typeof transactionPeople.$inferSelect)["source"];
      }
    >();
    for (const row of linkedPeople) {
      peopleMap.set(row.transactionId, {
        person: row.person,
        source: row.source,
      });
    }

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
        categories: categoryMap.get(row.transaction.id) ?? [],
        person: peopleMap.get(row.transaction.id)?.person ?? null,
        personSource: peopleMap.get(row.transaction.id)?.source ?? null,
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

export const getCategories = cache(
  async () => await db.select().from(categories).orderBy(asc(categories.name)),
);

export const getCategoriesWithUsage = cache(async () =>
  db
    .select({
      category: categories,
      transactionCount: count(transactionCategories.transactionId),
    })
    .from(categories)
    .leftJoin(
      transactionCategories,
      eq(categories.id, transactionCategories.categoryId),
    )
    .groupBy(categories.id)
    .orderBy(asc(categories.type), asc(categories.name)),
);

export const getCashBalance = cache(async (): Promise<CashBalance> => {
  const [{ net, lastDate }] = await db
    .select({
      net: sql<string>`sum(
        case when ${transactions.type} = 'income'
          then ${transactions.amount}
          else -${transactions.amount}
        end
      )`,
      lastDate: max(transactions.occurredAt),
    })
    .from(transactions)
    .where(eq(transactions.accountType, "cash"));

  return {
    balance: Number(net),
    lastTransactionDate: lastDate ?? new Date(),
  };
});

export interface PeopleOverviewRow {
  person: typeof peoples.$inferSelect;
  aliases: string[];
  sent: number;
  received: number;
  transactionCount: number;
}

export const getPeoplesOverview = cache(
  async (): Promise<PeopleOverviewRow[]> => {
    const [rows, aliasRows] = await Promise.all([
      db
        .select({
          person: peoples,
          sent: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.totalAmount} else 0 end), 0)`,
          received: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.totalAmount} else 0 end), 0)`,
          transactionCount: count(transactionPeople.transactionId),
        })
        .from(peoples)
        .leftJoin(transactionPeople, eq(transactionPeople.personId, peoples.id))
        .leftJoin(
          transactions,
          eq(transactions.id, transactionPeople.transactionId),
        )
        .groupBy(peoples.id)
        .orderBy(asc(peoples.name)),
      db.select().from(personAliases),
    ]);

    const aliasesByPerson = new Map<string, string[]>();
    for (const alias of aliasRows) {
      const existing = aliasesByPerson.get(alias.personId) ?? [];
      existing.push(alias.alias);
      aliasesByPerson.set(alias.personId, existing);
    }

    return rows.map((row) => ({
      person: row.person,
      aliases: aliasesByPerson.get(row.person.id) ?? [],
      sent: Number(row.sent),
      received: Number(row.received),
      transactionCount: row.transactionCount,
    }));
  },
);

export const getPersonDetail = cache(async (personId: string) => {
  const person = await db.query.peoples.findFirst({
    where: { id: personId },
    with: { aliases: true },
  });

  if (!person) return null;

  const links = await db
    .select({
      transaction: transactions,
      bankName: banks.name,
      source: transactionPeople.source,
    })
    .from(transactionPeople)
    .innerJoin(
      transactions,
      eq(transactionPeople.transactionId, transactions.id),
    )
    .leftJoin(banks, eq(transactions.bankId, banks.id))
    .where(eq(transactionPeople.personId, personId))
    .orderBy(desc(transactions.occurredAt));

  const sent = links
    .filter((link) => link.transaction.type === "expense")
    .reduce((sum, link) => sum + Number(link.transaction.totalAmount), 0);
  const received = links
    .filter((link) => link.transaction.type === "income")
    .reduce((sum, link) => sum + Number(link.transaction.totalAmount), 0);

  return { person, links, sent, received };
});

export async function loadPeopleWithAliases(): Promise<PersonWithAliases[]> {
  const rows = await db.query.peoples.findMany({
    with: { aliases: true },
    orderBy: (peoples, { asc }) => [asc(peoples.name)],
  });
  return rows.map((person) => ({
    id: person.id,
    name: person.name,
    aliases: person.aliases.map((alias) => alias.alias),
  }));
}
export const getTnxsByDate = cache(
  async (dayStart: Date, dayEnd: Date) =>
    await db
      .select({
        transaction: transactions,
        bank: banks,
      })
      .from(transactions)
      .leftJoin(banks, eq(transactions.bankId, banks.id))
      .leftJoin(smsMessages, eq(transactions.smsMessageId, smsMessages.id))
      .where(
        and(
          or(
            eq(transactions.accountType, "cash"),
            eq(smsMessages.status, "parsed"),
          ),
          gte(transactions.occurredAt, dayStart),
          lt(transactions.occurredAt, dayEnd),
        ),
      )
      .orderBy(transactions.occurredAt),
);
