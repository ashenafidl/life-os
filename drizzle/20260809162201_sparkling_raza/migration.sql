ALTER TABLE "sms_messages" DROP CONSTRAINT "sms_messages_original_message_id_sms_messages_id_fkey";--> statement-breakpoint
ALTER TABLE "sms_messages" DROP COLUMN "original_message_id";