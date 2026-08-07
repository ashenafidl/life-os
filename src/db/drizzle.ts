import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "@/db/schema/relations";

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — check your environment configuration.",
    );
  }

  return drizzle(process.env.DATABASE_URL!, { relations });
}

let _db: ReturnType<typeof createDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) _db = createDb();
    return _db[prop as keyof typeof _db];
  },
});
