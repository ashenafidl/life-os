import { eachDayOfInterval, format, startOfWeek, subDays } from "date-fns";
import { useMemo } from "react";

import DayTooltip from "@/components/finance/dashboard/day-tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import formatMoney from "@/lib/money-utils";
import { cn } from "@/lib/utils";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface ColorStep {
  bg: string;
  text: string;
}

const POSITIVE_STEPS: ColorStep[] = [
  {
    bg: "bg-green-100 dark:bg-green-950",
    text: "text-green-900 dark:text-green-200",
  },
  {
    bg: "bg-green-200 dark:bg-green-900",
    text: "text-green-900 dark:text-green-100",
  },
  {
    bg: "bg-green-300 dark:bg-green-800",
    text: "text-green-950 dark:text-green-50",
  },
  {
    bg: "bg-green-400 dark:bg-green-700",
    text: "text-green-950 dark:text-white",
  },
  { bg: "bg-green-500 dark:bg-green-600", text: "text-white" },
];

const NEGATIVE_STEPS: ColorStep[] = [
  { bg: "bg-red-100 dark:bg-red-950", text: "text-red-900 dark:text-red-200" },
  { bg: "bg-red-200 dark:bg-red-900", text: "text-red-900 dark:text-red-100" },
  { bg: "bg-red-300 dark:bg-red-800", text: "text-red-950 dark:text-red-50" },
  { bg: "bg-red-400 dark:bg-red-700", text: "text-red-950 dark:text-white" },
  { bg: "bg-red-500 dark:bg-red-600", text: "text-white" },
];

/** Color by direction (green = net income, red = net expense),
 * intensity by magnitude relative to the largest absolute value in
 * the visible window. Returns a paired {bg, text} — the text color
 * is tied to each step, not global, since a color readable on the
 * lightest tier disappears on the darkest one. */
function getIntensityClass(value: number, maxAbs: number): ColorStep {
  if (!value || maxAbs <= 0) {
    return { bg: "bg-muted", text: "text-muted-foreground" };
  }

  const ratio = Math.abs(value) / maxAbs;
  const steps = value > 0 ? POSITIVE_STEPS : NEGATIVE_STEPS;

  if (ratio > 0.8) return steps[4];
  if (ratio > 0.6) return steps[3];
  if (ratio > 0.4) return steps[2];
  if (ratio > 0.2) return steps[1];
  return steps[0];
}

interface Props {
  data: Record<string, number>;
}

export default function HeatmapCalendar({ data }: Props) {
  const { weeks, monthLabels } = useMemo(() => {
    const gridEnd = new Date();
    const gridStart = startOfWeek(subDays(gridEnd, 53 * 7 - 1), {
      weekStartsOn: 1,
    });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // Label a week column only when it contains the 1st of a month —
    // this is what makes the label land exactly at the month's start
    // rather than at some arbitrary offset within it.
    const monthLabels = weeks.map((week) => {
      const firstOfMonth = week.find((d) => d.getDate() === 1);
      return firstOfMonth ? format(firstOfMonth, "MMM") : null;
    });

    return { weeks, monthLabels };
  }, []);

  const max = Math.max(0, ...Object.values(data).map(Math.abs));
  const columnStyle = {
    gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Month labels — same column grid as the day grid below, so each
          label sits in the exact column where that week starts, instead
          of an independently-positioned row that could drift out of sync. */}
      <div className="flex flex-row gap-2">
        <div className="w-5 shrink-0" aria-hidden="true" />
        <div className="grid w-full gap-0.5" style={columnStyle}>
          {monthLabels.map((label, i) => (
            <span
              // oxlint-disable-next-line react/no-array-index-key
              key={i}
              className="text-muted-foreground truncate overflow-visible text-left text-xs whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <div
          className="text-muted-foreground grid w-5 shrink-0 items-center gap-0.5 text-center text-xs"
          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
        >
          {WEEK_LABELS.map((label, i) => (
            // oxlint-disable-next-line react/no-array-index-key
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="grid w-full gap-0.5" style={columnStyle}>
          {weeks.map((week, wi) => (
            <div
              // oxlint-disable-next-line react/no-array-index-key
              key={wi}
              className="grid gap-0.5"
              style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
            >
              {week.map((day) => {
                const { bg, text } = getIntensityClass(
                  data[format(day, "yyyy-MM-dd")],
                  max,
                );
                return (
                  <HoverCard key={day.toISOString()}>
                    <HoverCardTrigger delay={0} closeDelay={0}>
                      <div
                        className={cn(
                          "@container flex aspect-square w-full items-center justify-center overflow-hidden rounded-xs",
                          bg,
                          text,
                        )}
                      >
                        <span className="hidden truncate px-px text-[clamp(6px,40cqw,11px)] leading-none @[14px]:inline">
                          {formatMoney(data[format(day, "yyyy-MM-dd")], {
                            showEmptySymbol: false,
                            compact: true,
                          })}
                        </span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <DayTooltip day={day} />
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
