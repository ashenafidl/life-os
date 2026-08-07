ALTER TABLE "tasks" DROP CONSTRAINT "tasks_project_id_projects_id_fkey";--> statement-breakpoint
DROP TABLE "projects";--> statement-breakpoint
DROP TABLE "tasks";--> statement-breakpoint
DROP TYPE "task_status";