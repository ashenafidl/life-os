import { PlusIcon } from "@phosphor-icons/react/ssr";

import CountdownCard from "@/components/countdown/countdown-card";
import EventForm from "@/components/countdown/event-form";
import PastEvents from "@/components/countdown/past-events";
import AppDialog from "@/components/shared/app-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getCountdowns } from "@/lib/queries/countdown";

export default async function CountdownPage() {
  const allCountDowns = await getCountdowns();
  const now = new Date();
  const upcoming = allCountDowns
    .filter((countdown) => new Date(countdown.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = allCountDowns
    .filter((countdown) => new Date(countdown.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {upcoming.map((countdown) => (
          <CountdownCard key={countdown.id} countdown={countdown} />
        ))}

        <AppDialog
          trigger={
            <Card className="w-full" data-slot="dialog-trigger">
              <CardContent className="text-muted-foreground/50 flex h-full items-center justify-center text-6xl">
                <PlusIcon />
              </CardContent>
            </Card>
          }
          title="New Event"
        >
          <EventForm />
        </AppDialog>
      </div>

      {past.length > 0 && <PastEvents pastEvents={past} />}
    </div>
  );
}
