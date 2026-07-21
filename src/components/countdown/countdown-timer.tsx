"use client";

import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  date: Date;
}

export default function CountdownTimer({ date }: Props) {
  const [diff, setDiff] = useState(() => differenceInSeconds(date, new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setDiff(differenceInSeconds(date, new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  if (diff <= 0) {
    return "Today";
  }

  return new Intl.NumberFormat().format(diff);
}
