import { createHash } from "crypto";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { db } from "@/db/drizzle";
import { smsMessages } from "@/db/schema/finance";
import { parsePendingMessages } from "@/lib/sms-parser";

const messageSchema = z.object({
  id: z.number().int(),
  address: z.string().optional(),
  body: z.string().optional(),
  date: z.coerce.date(),
  dateSent: z.coerce.date(),
});

const syncSchema = z.object({
  messages: z.array(messageSchema),
});

function hashMessage(msg: z.infer<typeof messageSchema>) {
  const input = [
    msg.id,
    msg.address ?? "",
    msg.body ?? "",
    msg.date.toISOString(),
    msg.dateSent.toISOString(),
  ].join(":");

  return createHash("sha256").update(input).digest("base64url").slice(0, 22);
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = syncSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const rows = parsed.data.messages.map((msg) => ({
    smsId: msg.id ?? 0,
    address: msg.address ?? "Unknown",
    body: msg.body ?? "",
    date: msg.date,
    dateSent: msg.dateSent,
    rawHash: hashMessage(msg),
  }));

  // onConflictDoNothing on the (userId, rawHash) unique constraint means
  // re-syncing the same messages twice (e.g. after a dropped connection)
  // is always safe — duplicates are silently skipped, not rejected.
  const inserted = await db
    .insert(smsMessages)
    .values(rows)
    .onConflictDoNothing({ target: [smsMessages.rawHash] })
    .returning({ id: smsMessages.id });

  parsePendingMessages();

  return NextResponse.json({
    received: rows.length,
    inserted: inserted.length,
    duplicates: rows.length - inserted.length,
  });
}
