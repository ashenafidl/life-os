import { createInsertSchema } from "drizzle-orm/zod";
import z from "zod";

import { tasks } from "@/db/schema/shiplog";

export const taskInsertSchema = createInsertSchema(tasks, {
  name: z.string().nonempty(),
});

export type TaskInsert = z.infer<typeof taskInsertSchema>;
