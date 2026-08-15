"use server";

import { eq } from "drizzle-orm";
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
      .values({
        ...data,
        title: data.title.trim(),
      })
      .returning({ id: countdowns.id });

    revalidatePath("/countdown");
    return { id: row.id };
  });
}

export async function updateEvent(
  id: string,
  data: EventInsert,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    if (!id) {
      throw new ActionError("Event ID is required.");
    }

    if (!data.title?.trim()) {
      throw new ActionError("Event title is required.");
    }

    const [row] = await db
      .update(countdowns)
      .set({
        title: data.title.trim(),
        date: data.date,
      })
      .where(eq(countdowns.id, id))
      .returning({ id: countdowns.id });

    revalidatePath("/countdown");
    return { id: row.id };
  });
}

export async function deleteEvent(
  id: string,
): Promise<ActionResult<{ deletedId: string }>> {
  return runAction(async () => {
    if (!id) {
      throw new ActionError("Event ID is required");
    }

    const [row] = await db
      .delete(countdowns)
      .where(eq(countdowns.id, id))
      .returning({ deletedId: countdowns.id });

    revalidatePath("/countdown");
    return row;
  });
}
