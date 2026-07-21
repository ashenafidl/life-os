import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const countdowns = pgTable("countdowns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
