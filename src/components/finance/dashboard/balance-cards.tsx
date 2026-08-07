import { getBankBalances } from "@/actions/actions";
import FormattedDate from "@/components/shared/formatted-date";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import formatMoney from "@/lib/money-utils";

export default async function BalanceCards() {
  const { balances } = await getBankBalances();

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      {balances
        .filter((item) => item.balance)
        .map((balance) => (
          <Card key={balance.bankId} className="w-full sm:w-[320px] lg:w-90">
            <CardHeader>{balance.bankName}</CardHeader>

            <CardContent>
              <div className="flex items-end gap-2">
                <h1 className="font-heading text-5xl">
                  {formatMoney(balance.balance ?? 0, { compact: false })}
                </h1>

                <span className="text-muted-foreground text-lg">ETB</span>
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
  );
}
