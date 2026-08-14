"use client";

import { intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  date: Date;
}

export function getCountdownDisplay(date: Date, now = new Date()) {
  const isPast = date.getTime() < now.getTime();
  const start = isPast ? date : now;
  const end = isPast ? now : date;

  const duration = intervalToDuration({ start, end });

  const fullParts = [
    { value: duration.years ?? 0, label: "y" },
    { value: duration.months ?? 0, label: "mo" },
    { value: duration.days ?? 0, label: "d" },
    { value: duration.hours ?? 0, label: "h" },
    { value: duration.minutes ?? 0, label: "min" },
    { value: duration.seconds ?? 0, label: "s" },
  ].filter((part) => part.value > 0);

  const primaryPart = fullParts[0] ?? { value: 0, label: "s" };

  return {
    isPast,
    isNow: date.getTime() === now.getTime(),
    value: primaryPart.value,
    unit: primaryPart.label,
    text: `${primaryPart.value}${primaryPart.label}`,
    full:
      fullParts.map((part) => `${part.value}${part.label}`).join(" ") || "0s",
  };
}

export default function CountdownTimer({ date }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <span suppressHydrationWarning>—</span>;
  }

  const display = getCountdownDisplay(date, now);

  return (
    <span className="font-mono" title={display.full}>
      {display.isNow ? "Today" : display.text}
    </span>
  );
}
