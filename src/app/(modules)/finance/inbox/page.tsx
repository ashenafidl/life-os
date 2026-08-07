import { Suspense } from "react";

import InboxTable from "@/components/finance/inbox/inbox-table";

export default async function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl">
          Loading...
        </div>
      }
    >
      <InboxTable />
    </Suspense>
  );
}
