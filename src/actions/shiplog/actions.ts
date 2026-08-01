"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { projects, tasks } from "@/db/schema/shiplog";
import { TaskInsert } from "@/schemas/shiplog";

export async function createTask(data: TaskInsert) {
  await db.insert(tasks).values(data);
}

export async function getProjects() {
  return db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));
}

export async function createProject(name: string) {
  const [project] = await db
    .insert(projects)
    .values({ name: name.trim() })
    .returning({ id: projects.id, name: projects.name });

  return project;
}

export async function updateTaskStatus(
  taskId: string,
  status: "pending" | "completed",
) {
  await db
    .update(tasks)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  revalidatePath("/shiplog/tasks");
  revalidatePath("/shiplog/projects");
}
