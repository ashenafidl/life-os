import {
  CaretLeftIcon,
  CaretRightIcon,
  ReceiptXIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Route } from "next";
import Link from "next/link";

import SmsMatchViewer from "@/components/finance/sms-match-viewer";
import TransactionFilters from "@/components/finance/transactions/transaction-filters";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { buildFilterFields, decodeFilters } from "@/lib/filters";
import { getBanks, getTransactionReview } from "@/lib/queries/finance";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filters?: string }>;
}) {
  const { page: pageParam, filters: filtersParam } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const filters = decodeFilters(filtersParam);

  const [banks, result] = await Promise.all([
    getBanks(),
    getTransactionReview({ page, pageSize: 50, filters }),
  ]);

  const fields = buildFilterFields(
    banks.map((bank) => ({ value: bank.id, label: bank.name })),
  );

  const start = (result.meta.page - 1) * result.meta.pageSize + 1;
  const end = Math.min(
    result.meta.page * result.meta.pageSize,
    result.meta.totalItems,
  );
  const total = result.meta.totalItems;

  return (
    <div className="relative w-full">
      <div className="absolute w-full">
        <div className="bg-background sticky top-0 z-10 flex flex-row justify-between p-4">
          <div className="relative">
            <TransactionFilters fields={fields} />
          </div>

          <ButtonGroup>
            <PagerButton
              href={`?page=${page - 1}`}
              disabled={!result.meta.hasPreviousPage}
            >
              <CaretLeftIcon />
            </PagerButton>

            <Button variant="secondary" disabled>
              {total === 0 ? "0 of 0" : `${start}–${end} of ${total}`}
            </Button>

            <PagerButton
              href={`?page=${page + 1}`}
              disabled={!result.meta.hasNextPage}
            >
              <CaretRightIcon />
            </PagerButton>
          </ButtonGroup>
        </div>

        {/* Content area with same horizontal padding and a consistent gap from header */}
        <div className="px-4 py-0.5 pb-4">
          {result.data.length > 0 ? (
            <>
              {result.data.map((review) => (
                <SmsMatchViewer key={review.transaction.id} review={review} />
              ))}
            </>
          ) : (
            <Empty className="my-24">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptXIcon />
                </EmptyMedia>
                <EmptyTitle>No transactions</EmptyTitle>
                <EmptyDescription>
                  There is no transaction. Reset filters or sync SMS messages to
                  view transactions.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="secondary" disabled>
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      nativeButton={false}
      render={<Link href={href as Route} scroll={false} />}
    >
      {children}
    </Button>
  );
}
