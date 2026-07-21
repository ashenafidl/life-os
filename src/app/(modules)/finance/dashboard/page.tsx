import { startOfWeek, subDays } from "date-fns";

import { getBankBalances, getDailyTotals } from "@/actions/actions";
import HeatmapCalendar from "@/components/finance/heatmap-calendar";
import FormattedDate from "@/components/shared/formatted-date";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import formatMoney from "@/lib/money-utils";

export default async function DashboardPage() {
  const { balances } = await getBankBalances();

  const to = new Date();
  const from = startOfWeek(subDays(to, 53 * 7 - 1));

  const dayTotals = await getDailyTotals(from, to);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-stretch gap-4">
        {balances
          .filter((item) => item.balance)
          .map((balance) => (
            <Card key={balance.bankId}>
              <CardHeader>{balance.bankName}</CardHeader>
              <CardContent>
                <div className="flex flex-row items-end gap-2">
                  <h1 className="font-heading text-5xl">
                    {formatMoney(balance.balance ?? 0, { compact: false })}
                  </h1>
                  <span className="text-muted-foreground h-fit text-lg leading-snug">
                    ETB
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-muted-foreground text-xs">
                  <FormattedDate date={balance.asOf ?? new Date()} />
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>

      <Card>
        <CardContent>
          <HeatmapCalendar data={dayTotals} />
        </CardContent>
      </Card>
    </div>
  );
}
