import { PlusIcon } from "@phosphor-icons/react/ssr";

import CountdownTimer from "@/components/countdown/countdown-timer";
import EventForm from "@/components/countdown/event-form";
import AppDialog from "@/components/shared/app-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { getCountdowns } from "@/lib/queries/countdown";

export default async function CountdownPage() {
  const allCountDowns = await getCountdowns();

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
      {allCountDowns.map((countdown) => {
        return (
          <Card key={countdown.id} className="w-full">
            <CardHeader className="text-muted-foreground text-center">
              <CardTitle>{countdown.title}</CardTitle>
            </CardHeader>
            <CardContent className="font-heading flex h-full items-center justify-center text-6xl">
              <CountdownTimer date={countdown.date} />
            </CardContent>
            <CardFooter className="text-muted-foreground justify-center">{`days until ${formatDate(countdown.date)}`}</CardFooter>
          </Card>
        );
      })}

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
  );
}
