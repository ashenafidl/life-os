import { WalletIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "cn";
import Image from "next/image";

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

  // Empty state — no banks with a balance to show
  if (balances.length === 0) {
    return (
      <Card className="flex w-full flex-col items-center justify-center gap-2 border-dashed py-10 text-center">
        <CardContent className="flex flex-col items-center gap-2 pt-0">
          <WalletIcon className="text-muted-foreground/60 size-8" />
          <h1 className="font-heading text-xl">No balances yet</h1>
          <p className="text-muted-foreground text-sm">
            Sync sms messages with real transaction to see your balances.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex scrollbar-none items-stretch gap-4 overflow-x-auto py-0.5">
      {/* Total balance + divider — sticky so they stay visible while
          individual bank cards scroll underneath */}
      <div className="bg-background ring-background sticky left-0 z-10 flex shrink-0 items-stretch border-r pr-4 ring-1">
        <Card className="from-primary to-primary text-primary-foreground border-primary w-fit bg-linear-to-br">
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
              Across {balances.length} bank
              {balances.length !== 1 ? "s" : ""}
            </div>
          </CardFooter>
        </Card>
      </div>

      {balances.map((balance) => {
        const [brandFrom, brandTo] = balance.bankColors ?? [];
        const branded = Boolean(brandFrom && brandTo);

        return (
          <Card
            key={balance.bankId}
            className={cn(
              "w-full max-w-fit shrink-0 shadow-none sm:w-[320px] lg:min-w-90",
              branded && "border-transparent text-white ring-black/20",
            )}
            style={
              branded
                ? {
                    backgroundImage: `linear-gradient(to bottom right, ${brandFrom}, ${brandTo})`,
                  }
                : undefined
            }
          >
            <CardHeader className="flex flex-row items-center gap-3">
              {balance.bankLogo ? (
                <Image
                  src={balance.bankLogo}
                  alt={balance.bankName}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg bg-white/90 object-contain p-1"
                />
              ) : (
                <WalletIcon className="size-8 shrink-0 opacity-70" />
              )}
              <span className="truncate font-medium">{balance.bankName}</span>
            </CardHeader>
            <CardContent className="flex flex-row items-end gap-2">
              <h1 className="font-heading text-5xl">
                {formatMoney(balance.balance ?? 0, { compact: false })}
              </h1>
              <span className="text-lg opacity-80">ETB</span>
            </CardContent>
            <CardFooter>
              <div
                className={cn(
                  "text-xs",
                  branded ? "opacity-70" : "text-muted-foreground",
                )}
              >
                <FormattedDate date={balance.asOf ?? new Date()} />
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
