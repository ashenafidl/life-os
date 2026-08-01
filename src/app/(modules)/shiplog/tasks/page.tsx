import { eq } from "drizzle-orm";
import Link from "next/link";

import TaskItem from "@/components/shiplog/task-item";
import { db } from "@/db/drizzle";
import { projects, tasks } from "@/db/schema/shiplog";
import { cn } from "@/lib/utils";

type TaskStatusFilter = "all" | "pending" | "completed";

type ShipLogPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const statusFilters: TaskStatusFilter[] = ["all", "pending", "completed"];

function getStatusFilter(status: string | undefined): TaskStatusFilter {
  return status === "pending" || status === "completed" ? status : "all";
}

function StatusFilters({ activeStatus }: { activeStatus: TaskStatusFilter }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statusFilters.map((status) => (
        <Link
          key={status}
          href={
            status === "all"
              ? "/shiplog/tasks"
              : `/shiplog/tasks?status=${status}`
          }
          className={cn(
            "rounded-full border px-3 py-1 text-sm capitalize transition-colors",
            activeStatus === status
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted",
          )}
        >
          {status}
        </Link>
      ))}
    </div>
  );
}

export default async function ShipLogPage({ searchParams }: ShipLogPageProps) {
  const { status } = await searchParams;
  const activeStatus = getStatusFilter(status);

  const query = db
    .select({
      id: tasks.id,
      name: tasks.name,
      status: tasks.status,
      createdAt: tasks.createdAt,
      projectId: tasks.projectId,
      projectName: projects.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .$dynamic();

  if (activeStatus !== "all") {
    query.where(eq(tasks.status, activeStatus));
  }

  const allTasks = await query.orderBy(tasks.createdAt);

  return (
    <div className="p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <StatusFilters activeStatus={activeStatus} />
        </div>
        {allTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
