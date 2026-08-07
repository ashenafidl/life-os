import { startOfWeek, subDays } from "date-fns";
import { connection } from "next/server";

import { getDailyTotals } from "@/actions/actions";
import HeatmapCalendar from "@/components/finance/heatmap-calendar";
import { Card, CardContent } from "@/components/ui/card";

export default async function HeatmapCalendarCard() {
  await connection();

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
