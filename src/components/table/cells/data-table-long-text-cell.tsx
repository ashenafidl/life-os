"use client";

import { useEffect, useRef, useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export default function DataTableLongTextCell({ text }: { text: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (el) {
      // Check if the rendered text is truncated (scroll width > client width)
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, []);

  const display = (
    <span
      ref={spanRef}
      className={cn("inline-block max-w-96 truncate align-middle", {
        "cursor-help": isTruncated,
      })}
    >
      {text || "-"}
    </span>
  );

  if (!isTruncated) return display;

  return (
    <HoverCard>
      <HoverCardTrigger render={display} />
      <HoverCardContent className="max-w-sm">{text}</HoverCardContent>
    </HoverCard>
  );
}
