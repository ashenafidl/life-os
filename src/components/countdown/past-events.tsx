"use client";

import CountdownCard from "@/components/countdown/countdown-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { countdowns } from "@/db/schema/countdown";

interface Props {
  pastEvents: (typeof countdowns.$inferSelect)[];
}

export default function PastEvents({ pastEvents }: Props) {
  return (
    <Accordion className="w-full">
      <AccordionItem value="past-events" className="rounded-md border">
        <AccordionTrigger className="text-muted-foreground px-4 text-sm font-medium hover:no-underline">
          Past events ({pastEvents.length})
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 xl:grid-cols-4">
            {pastEvents.map((countdown) => (
              <CountdownCard key={countdown.id} countdown={countdown} isPast />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
