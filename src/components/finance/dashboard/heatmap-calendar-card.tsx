import { addDays, startOfDay, startOfWeek, subDays } from "date-fns";

import HeatmapCalendar from "@/components/finance/heatmap-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { getDailyTotals } from "@/lib/queries/finance";

export default async function HeatmapCalendarCard() {
  const today = startOfDay(new Date());
  const to = addDays(today, 1);

  const from = startOfWeek(subDays(today, 53 * 7 - 1), {
    weekStartsOn: 1,
  });

  const dayTotals = await getDailyTotals(from, to);

  return (
    <Card>
      <CardContent>
        <HeatmapCalendar data={dayTotals} gridStart={from} gridEnd={today} />
      </CardContent>
    </Card>
  );
}
