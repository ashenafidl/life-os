import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "@/db/schema/relations";

config({ path: ".env" });

export const db = drizzle(process.env.DATABASE_URL!, { relations });
