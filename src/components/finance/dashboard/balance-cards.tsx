import { WalletIcon } from "@phosphor-icons/react/dist/ssr";

import FormattedDate from "@/components/shared/formatted-date";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import formatMoney from "@/lib/money-utils";
import { getBankBalances } from "@/lib/queries/finance";

export default async function BalanceCards() {
  const { balances, total } = await getBankBalances();
  const visibleBalances = balances.filter((item) => item.balance);

  return (
    <div className="flex scrollbar-none items-stretch gap-4 overflow-x-auto py-0.5">
      {/* Total balance + divider — sticky so they stay visible while
          individual bank cards scroll underneath */}
      <div className="bg-background ring-background sticky left-0 z-10 flex shrink-0 items-stretch border-r pr-4 ring-1">
        <Card className="from-primary to-primary text-primary-foreground border-primary w-full bg-linear-to-br sm:w-[320px] lg:w-90">
          <CardHeader className="flex items-center justify-between">
            <span>Total Balance</span>
            <WalletIcon className="size-5 opacity-80" />
          </CardHeader>

          <CardContent>
            <div className="flex items-end gap-2">
              <h1 className="font-heading text-5xl">
                {formatMoney(total, { compact: false })}
              </h1>
              <span className="text-lg opacity-80">ETB</span>
            </div>
          </CardContent>

          <CardFooter>
            <div className="text-xs opacity-70">
              Across {visibleBalances.length} bank
              {visibleBalances.length !== 1 ? "s" : ""}
            </div>
          </CardFooter>
        </Card>
      </div>

      {visibleBalances.map((balance) => (
        <Card
          key={balance.bankId}
          className="w-full shrink-0 shadow-none sm:w-[320px] lg:w-90"
        >
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
