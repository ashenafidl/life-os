import { startOfWeek, subDays } from "date-fns";

import HeatmapCalendar from "@/components/finance/heatmap-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { getDailyTotals } from "@/lib/queries/finance";

export default async function HeatmapCalendarCard() {
  const to = new Date();
  const from = startOfWeek(subDays(to, 53 * 7 - 1));

  const dayTotals = await getDailyTotals(from, to);

  return (
    <Card>
      <CardContent>
        <HeatmapCalendar data={dayTotals} />
      </CardContent>
    </Card>
  );
}
