import { Suspense } from "react";

import Dashboard from "@/components/finance/dashboard";

export default async function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl">
          Loading...
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
