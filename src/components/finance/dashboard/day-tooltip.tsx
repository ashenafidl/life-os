import { addDays, format, startOfDay } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { banks, transactions } from "@/db/schema/finance";
import formatMoney from "@/lib/money-utils";
import { cn } from "@/lib/utils";

interface Props {
  day: Date;
}

export default async function DayTooltip({ day }: Props) {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  const rows = await db
    .select({
      transaction: transactions,
      bank: banks,
    })
    .from(transactions)
    .innerJoin(banks, eq(transactions.bankId, banks.id))
    .where(
      and(
        gte(transactions.occurredAt, dayStart),
        lt(transactions.occurredAt, dayEnd),
      ),
    )
    .orderBy(transactions.occurredAt);

  let net = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  for (const row of rows) {
    const amount = parseFloat(row.transaction.amount);
    if (row.transaction.type === "income") {
      totalIncome += amount;
      net += amount;
    } else {
      totalExpense += amount;
      net -= amount;
    }
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {format(day, "EEEE, MMM d, yyyy")}
        </p>
        <p className="text-muted-foreground text-xs">
          No transactions on this day.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">
          {format(day, "EEEE, MMM d, yyyy")}
        </p>
        <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
          <span>
            {rows.length} transaction
            {rows.length !== 1 ? "s" : ""}
          </span>
          <span
            className={cn(
              "font-medium",
              net >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            Net {net >= 0 ? "+" : ""}
            {formatMoney(net)}
          </span>
        </div>
        <div className="text-muted-foreground mt-0.5 flex items-center justify-between text-xs">
          <span>
            Income{" "}
            <span className="text-green-600 dark:text-green-400">
              {formatMoney(totalIncome)}
            </span>
          </span>
          <span>
            Expense{" "}
            <span className="text-red-600 dark:text-red-400">
              -{formatMoney(totalExpense)}
            </span>
          </span>
        </div>
      </div>

      <div className="divide-border/50 divide-y">
        {rows.map((row) => (
          <div
            key={row.transaction.id}
            className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 py-1.5 text-xs"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{row.bank.name}</p>
              <p className="text-muted-foreground truncate">
                {row?.transaction?.recipientName ?? "UNKNOWN"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-medium",
                  row.transaction.type === "income"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {row.transaction.type === "income" ? "+" : "-"}
                {formatMoney(row.transaction.amount)}
              </p>
              <p className="text-muted-foreground">
                {format(row.transaction.occurredAt ?? "", "HH:mm")}
              </p>
            </div>
            <div className="text-muted-foreground col-span-2 flex justify-between">
              <span>Balance after</span>
              <span>
                {row.transaction.balanceAfter != null
                  ? formatMoney(row.transaction.balanceAfter)
                  : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
