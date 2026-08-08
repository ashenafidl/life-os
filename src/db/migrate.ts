// oxlint-disable no-console
import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "@/db/drizzle";

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
});
