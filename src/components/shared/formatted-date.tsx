"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDate, formatFullDateTime } from "@/lib/date-utils";

export default function FormattedDate({ date }: { date: Date | string }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        closeDelay={0}
        render={<span className="cursor-help">{formatDate(date)}</span>}
      />
      <HoverCardContent side="top" className="w-auto text-sm">
        {formatFullDateTime(date)}
      </HoverCardContent>
    </HoverCard>
  );
}
