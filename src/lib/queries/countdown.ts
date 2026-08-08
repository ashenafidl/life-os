import { cache } from "react";

import { db } from "@/db/drizzle";
import { countdowns } from "@/db/schema/countdown";

export const getCountdowns = cache(async () => {
  return await db.select().from(countdowns).orderBy(countdowns.date);
});
