import { createHash } from "crypto";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { db } from "@/db/drizzle";
import { smsMessages } from "@/db/schema/finance";
import { parsePendingMessages } from "@/lib/sms-parser";

const syncSchema = z.object({
  messages: z
    .array(
      z.object({
        smsId: z.number().int(),
        address: z.string().min(1),
        body: z.string().min(1),
        date: z.coerce.date(),
      }),
    )
    .min(1),
});

function hashMessage(
  smsId: number,
  address: string,
  body: string,
  date: string,
) {
  return createHash("sha256")
    .update(`${smsId}:${address}:${body}:${date}`)
    .digest("hex");
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
    smsId: msg.smsId,
    address: msg.address,
    body: msg.body,
    date: msg.date,
    rawHash: hashMessage(
      msg.smsId,
      msg.address,
      msg.body,
      msg.date.toISOString(),
    ),
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
