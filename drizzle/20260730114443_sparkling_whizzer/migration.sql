CREATE TYPE "sms_status" AS ENUM('pending', 'parsed', 'unmatched');--> statement-breakpoint
CREATE TYPE "transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "countdowns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bank_id" uuid NOT NULL,
	"label" text NOT NULL,
	"type" "transaction_type",
	"regex" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"short_codes" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sms_id" integer NOT NULL,
	"sender" text NOT NULL,
	"body" text NOT NULL,
	"received_at" timestamp NOT NULL,
	"raw_hash" text NOT NULL UNIQUE,
	"status" "sms_status" DEFAULT 'pending'::"sms_status" NOT NULL,
	"bank_id" uuid,
	"parsed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sms_message_id" uuid NOT NULL UNIQUE,
	"bank_id" uuid NOT NULL,
	"pattern_id" uuid NOT NULL,
	"type" "transaction_type",
	"tnx_id" text UNIQUE,
	"sender" text,
	"sender_account" text,
	"recipient_name" text,
	"recipient_phone" text,
	"sender_phone" text,
	"service_charge" numeric(14,2),
	"vat" numeric(14,2),
	"disaster_recovery" numeric(14,2),
	"amount" numeric(14,2) NOT NULL,
	"total_amount" numeric(14,2) NOT NULL,
	"balance_after" numeric(14,2),
	"reference" text,
	"occurred_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uniquePerBank" ON "bank_patterns" ("bank_id","label");--> statement-breakpoint
ALTER TABLE "bank_patterns" ADD CONSTRAINT "bank_patterns_bank_id_banks_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_bank_id_banks_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sms_message_id_sms_messages_id_fkey" FOREIGN KEY ("sms_message_id") REFERENCES "sms_messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bank_id_banks_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pattern_id_bank_patterns_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "bank_patterns"("id");