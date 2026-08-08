"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/drizzle";
import { smsMessages } from "@/db/schema/finance";
import { parseMessages } from "@/lib/sms-parser";

export async function deleteAllUnmatched() {
  await db
    .delete(smsMessages)
    .where(
      and(eq(smsMessages.status, "unmatched"), isNull(smsMessages.bankId)),
    );
  revalidatePath("/finance/inbox");
}

export async function parseAllMessages(scope: "all" | "unmatched") {
  const whereClause =
    scope === "unmatched" ? eq(smsMessages.status, "unmatched") : undefined;
  const pendingMessages = await db
    .select()
    .from(smsMessages)
    .where(whereClause);

  revalidatePath("/finance/inbox");

  return parseMessages(pendingMessages);
}
