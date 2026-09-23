CREATE TYPE "account_type" AS ENUM('bank', 'cash');--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "account_type" "account_type" DEFAULT 'bank'::"account_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_opening_balance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "sms_message_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "bank_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "pattern_id" DROP NOT NULL;