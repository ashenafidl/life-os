import { and, eq, sql } from "drizzle-orm";
import type { Route } from "next";
import Link from "next/link";

import TaskItem from "@/components/shiplog/task-item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { db } from "@/db/drizzle";
import { projects, tasks } from "@/db/schema/shiplog";
import { cn } from "@/lib/utils";
import { TaskStatusFilter } from "@/types/shiplog";

type ProjectsPageProps = {
  searchParams: Promise<{
    project?: string;
    status?: string;
  }>;
};

const statusFilters: TaskStatusFilter[] = ["all", "pending", "completed"];

function getStatusFilter(status: string | undefined): TaskStatusFilter {
  return status === "pending" || status === "completed" ? status : "all";
}

function projectHref(
  projectId: string | null,
  status: TaskStatusFilter,
): Route {
  const params = new URLSearchParams();

  if (projectId) params.set("project", projectId);
  if (status !== "all") params.set("status", status);

  const query = params.toString();
  return (query ? `/shiplog/projects?${query}` : "/shiplog/projects") as Route;
}

function StatusFilters({
  activeProjectId,
  activeStatus,
}: {
  activeProjectId: string | null;
  activeStatus: TaskStatusFilter;
}) {
  return (
    <ToggleGroup
      variant="outline"
      defaultValue={[activeStatus.valueOf()]}
      aria-label="Task status"
    >
      {statusFilters.map((status) => (
        <ToggleGroupItem
          key={status}
          value={status}
          className="capitalize transition-colors"
        >
          <Link href={projectHref(activeProjectId, status)}> {status}</Link>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { project, status } = await searchParams;
  const activeStatus = getStatusFilter(status);
  const activeProjectId = project ?? null;

  const allProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      pendingCount: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'pending')`,
      completedCount: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'completed')`,
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .groupBy(projects.id)
    .orderBy(projects.name);

  const selectedProject =
    allProjects.find((item) => item.id === activeProjectId) ?? allProjects[0];
  const selectedProjectId = selectedProject?.id ?? null;

  const taskConditions = [];
  if (selectedProjectId)
    taskConditions.push(eq(tasks.projectId, selectedProjectId));
  if (activeStatus !== "all")
    taskConditions.push(eq(tasks.status, activeStatus));

  const projectTasks = selectedProjectId
    ? await db
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
        .where(and(...taskConditions))
        .orderBy(tasks.createdAt)
    : [];

  return (
    <div className="p-4">
      <div className="container mx-auto grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside>
          <div className="border-b p-2">
            <h1 className="font-semibold">Projects</h1>
            <p className="text-muted-foreground text-sm">
              Filter tasks by project.
            </p>
          </div>

          <div>
            {allProjects.map((project) => (
              <Link
                key={project.id}
                href={projectHref(project.id, activeStatus)}
                className={cn(
                  "block p-3 transition-colors hover:bg-muted border-b",
                  selectedProjectId === project.id && "bg-muted",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{project.name}</h3>
                    {project.description && (
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="text-muted-foreground shrink-0 text-xs">
                    {Number(project.pendingCount) +
                      Number(project.completedCount)}
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                    {Number(project.pendingCount)} pending
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                    {Number(project.completedCount)} done
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <section className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {selectedProject?.name ?? "No project selected"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {selectedProject
                  ? "Tasks for the selected project."
                  : "Create a project to start filtering tasks."}
              </p>
            </div>
            <StatusFilters
              activeProjectId={selectedProjectId}
              activeStatus={activeStatus}
            />
          </div>

          {projectTasks.length > 0 ? (
            projectTasks.map((task) => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              No tasks match this project and status.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
