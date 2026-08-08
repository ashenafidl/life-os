"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { countdowns } from "@/db/schema/countdown";
import { ActionError, ActionResult, runAction } from "@/lib/action-result";
import { EventInsert } from "@/schemas/countdown";

export async function createEvent(
  data: EventInsert,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    if (!data.title?.trim()) {
      throw new ActionError("Event title is required.");
    }

    const [row] = await db
      .insert(countdowns)
      .values(data)
      .returning({ id: countdowns.id });

    revalidatePath("/countdown");
    return { id: row.id };
  });
}
