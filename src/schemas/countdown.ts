import { createInsertSchema } from "drizzle-orm/zod";
import z from "zod";

import { countdowns } from "@/db/schema/countdown";

export const eventInsertSchema = createInsertSchema(countdowns, {
  title: z.string().nonempty(),
  date: z.date(),
});

export type EventInsert = z.infer<typeof eventInsertSchema>;
