import {
  CalendarDotsIcon,
  CheckCircleIcon,
  CircleIcon,
  HashIcon,
} from "@phosphor-icons/react/dist/ssr";

import { updateTaskStatus } from "@/actions/shiplog/actions";
import FormattedDate from "@/components/shared/formatted-date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskStatus = "pending" | "completed";

type TaskItemProps = {
  task: {
    id: string;
    name: string;
    status: TaskStatus;
    createdAt: Date;
    projectId: string | null;
    projectName: string | null;
  };
};

export default function TaskItem({ task }: TaskItemProps) {
  const isCompleted = task.status === "completed";
  const nextStatus = isCompleted ? "pending" : "completed";

  return (
    <div className="flex items-start gap-3 border-b py-3">
      <form
        action={async () => {
          "use server";
          await updateTaskStatus(task.id, nextStatus);
        }}
      >
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          className="mt-0.5"
          aria-label={`Mark task as ${nextStatus}`}
        >
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-sm border",
              isCompleted
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-muted-foreground/50 bg-background",
            )}
          >
            {isCompleted && <CheckCircleIcon size={14} weight="fill" />}
          </span>
        </Button>
      </form>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "leading-snug",
              isCompleted && "text-muted-foreground",
            )}
          >
            {task.name}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isCompleted
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
          >
            {isCompleted ? (
              <CheckCircleIcon size={12} weight="fill" />
            ) : (
              <CircleIcon size={12} weight="fill" />
            )}
            {isCompleted ? "Completed" : "Pending"}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <div className="flex items-center gap-0.5">
            <CalendarDotsIcon size={14} />
            <span className="leading-snug">
              <FormattedDate date={task.createdAt} format="since" />
            </span>
          </div>
          {task.projectId && (
            <div className="flex items-center gap-0.5">
              <HashIcon size={14} />
              <span className="leading-snug">{task.projectName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
