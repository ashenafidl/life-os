ALTER TABLE "sms_messages" RENAME COLUMN "received_at" TO "date";--> statement-breakpoint
ALTER TABLE "sms_messages" ADD COLUMN "date_sent" timestamp NOT NULL;