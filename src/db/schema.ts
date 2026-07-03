import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: date("date"), // null = unscheduled/someday
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
