import CountdownTimer from "@/components/countdown/countdown-timer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";

export default function CountdownCard({
  countdown,
  isPast = false,
}: {
  countdown: { id: string; title: string; date: Date };
  isPast?: boolean;
}) {
  const relation = isPast ? "since" : "until";

  return (
    <Card key={countdown.id} className="w-full">
      <CardHeader className="text-muted-foreground text-center">
        <CardTitle>{countdown.title}</CardTitle>
      </CardHeader>
      <CardContent className="font-heading flex h-full items-center justify-center text-6xl">
        <CountdownTimer date={new Date(countdown.date)} />
      </CardContent>
      <CardFooter className="text-muted-foreground justify-center">
        {`${relation} ${formatDate(countdown.date)}`}
      </CardFooter>
    </Card>
  );
}
