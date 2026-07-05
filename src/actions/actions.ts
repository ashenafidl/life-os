"use server";

import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";

type NewProject = typeof projects.$inferInsert;

export async function createProject(values: NewProject) {
  await db.insert(projects).values(values);
}
