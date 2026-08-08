"use client";

import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  date: Date;
}

export default function CountdownTimer({ date }: Props) {
  // Starts as null so the server-rendered HTML and the client's first
  // render are identical — neither one calls `new Date()` yet. The real,
  // "now"-dependent value is only computed after mount, client-side only,
  // where there's no server render left to mismatch against.
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    setDiff(differenceInSeconds(date, new Date()));

    const interval = setInterval(() => {
      setDiff(differenceInSeconds(date, new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  if (diff === null) {
    return <span suppressHydrationWarning>—</span>;
  }

  if (diff <= 0) {
    return "Today";
  }

  return new Intl.NumberFormat().format(diff);
}
