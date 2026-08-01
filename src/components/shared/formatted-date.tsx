"use client";

import { differenceInDays } from "date-fns";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDate, formatFullDateTime } from "@/lib/date-utils";

interface Props {
  date: Date | string;
  format?: "date" | "since";
}

export default function FormattedDate({ date, format = "date" }: Props) {
  const sinceDays = differenceInDays(new Date(), new Date(date));

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        closeDelay={0}
        render={
          <span className="cursor-help">
            {format === "since"
              ? sinceDays === 0
                ? "Today"
                : sinceDays === 1
                  ? "Yesterday"
                  : `${sinceDays} days ago`
              : formatDate(date)}
          </span>
        }
      />
      <HoverCardContent side="top" className="w-auto text-sm">
        {formatFullDateTime(date)}
      </HoverCardContent>
    </HoverCard>
  );
}
