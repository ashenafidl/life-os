CREATE TYPE "transaction_link_type" AS ENUM('refund', 'cashback');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_categories" (
	"transaction_id" uuid,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_categories_pkey" PRIMARY KEY("transaction_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "transaction_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"transaction_id" uuid NOT NULL UNIQUE,
	"linked_transaction_id" uuid NOT NULL UNIQUE,
	"type" "transaction_link_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "no_self_link" ON "transaction_links" ("transaction_id","linked_transaction_id");--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transaction_links" ADD CONSTRAINT "transaction_links_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transaction_links" ADD CONSTRAINT "transaction_links_linked_transaction_id_transactions_id_fkey" FOREIGN KEY ("linked_transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;