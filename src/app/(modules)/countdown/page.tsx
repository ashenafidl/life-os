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
import { db } from "@/db/drizzle";
import { countdowns } from "@/db/schema/countdown";
import { formatDate } from "@/lib/date-utils";

export default async function CountdownHomePage() {
  const allCountDowns = await db.select().from(countdowns);

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
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
          <Card className="w-full">
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
