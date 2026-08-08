// oxlint-disable react/no-array-index-key
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKS = 53;
const columnStyle = { gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` };

export default function HeatmapCalendarCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-1">
          {/* Month labels row — a handful of short bars, roughly matching
              how many month labels typically appear across 53 weeks. */}
          <div className="flex flex-row gap-2">
            <div className="w-5 shrink-0" aria-hidden="true" />
            <div className="flex w-full justify-between gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-6" />
              ))}
            </div>
          </div>

          <div className="flex flex-row gap-2">
            {/* Week-of-day label column, same width as the real M/T/W/T/F/S/S column */}
            <div
              className="grid w-5 shrink-0 items-center gap-0.5"
              style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
            >
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="mx-auto h-3 w-3 rounded-sm" />
              ))}
            </div>

            {/* Day grid — identical column count/sizing to the real heatmap,
                so the skeleton occupies exactly the same footprint. */}
            <div className="grid w-full gap-0.5" style={columnStyle}>
              {Array.from({ length: WEEKS }).map((_, wi) => (
                <div
                  key={wi}
                  className="grid gap-0.5"
                  style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
                >
                  {Array.from({ length: 7 }).map((_, di) => (
                    <Skeleton
                      key={di}
                      className="aspect-square w-full rounded-xs"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
