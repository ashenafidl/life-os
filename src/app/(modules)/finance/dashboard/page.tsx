import { Suspense } from "react";

import BalanceCardSkeleton from "@/components/finance/dashboard/balance-card-skeleton";
import BalanceCards from "@/components/finance/dashboard/balance-cards";
import HeatmapCalendarCard from "@/components/finance/dashboard/heatmap-calendar-card";
import HeatmapCalendarCardSkeleton from "@/components/finance/dashboard/heatmap-calendar-card-skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-4">
      <Suspense fallback={<BalanceCardSkeleton />}>
        <BalanceCards />
      </Suspense>

      <Suspense fallback={<HeatmapCalendarCardSkeleton />}>
        <HeatmapCalendarCard />
      </Suspense>
    </div>
  );
}
