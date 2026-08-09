ALTER TABLE "sms_messages" RENAME COLUMN "sender" TO "address";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "sender" TO "sender_name";