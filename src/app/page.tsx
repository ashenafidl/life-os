import { format, isToday } from "date-fns";

import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { cn } from "@/lib/utils";

export default async function Home() {
  const allTasks = await db.select().from(tasks);

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-8 p-6">
      {next7Days.map((day) => (
        <div key={day.toISOString()}>
          <div className="uppercase">
            <p className="text-muted-foreground text-xs">
              {format(day, "MMM d, yyyy")}
            </p>
            <p
              className={cn(
                "font-heading text-lg",
                isToday(day) && "text-primary",
              )}
            >
              {format(day, "EEEE")}
            </p>
          </div>

          <div className="border-border my-2 border-t border-dashed" />

          {/* Task list */}
          <div className="flex flex-col">
            {allTasks.map((task) => (
              <div key={task.id} className="line-clamp-1 text-ellipsis">
                {task.title} - {task.date}
              </div>
            ))}
            <input
              placeholder="Add a task"
              className="text-muted-foreground placeholder:text-muted-foreground/60 w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
