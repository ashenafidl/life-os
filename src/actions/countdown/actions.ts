"use server";

import { db } from "@/db/drizzle";
import { countdowns } from "@/db/schema/countdown";
import { EventInsert } from "@/schemas/countdown";

export async function createEvent(data: EventInsert) {
  await db.insert(countdowns).values(data);
}
