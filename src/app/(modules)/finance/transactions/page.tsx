import { Suspense } from "react";

import TransactionList from "@/components/finance/transaction-list";

export default async function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl">
          Loading...
        </div>
      }
    >
      <TransactionList />
    </Suspense>
  );
}
