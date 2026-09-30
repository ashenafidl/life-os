CREATE TYPE "match_source" AS ENUM('auto', 'manual');--> statement-breakpoint
CREATE TABLE "peoples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"person_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_people" (
	"transaction_id" uuid,
	"person_id" uuid,
	"source" "match_source" DEFAULT 'auto'::"match_source" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_people_pkey" PRIMARY KEY("transaction_id","person_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_person_alias" ON "person_aliases" ("person_id","alias");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_transaction_person" ON "transaction_people" ("transaction_id");--> statement-breakpoint
ALTER TABLE "person_aliases" ADD CONSTRAINT "person_aliases_person_id_peoples_id_fkey" FOREIGN KEY ("person_id") REFERENCES "peoples"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transaction_people" ADD CONSTRAINT "transaction_people_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transaction_people" ADD CONSTRAINT "transaction_people_person_id_peoples_id_fkey" FOREIGN KEY ("person_id") REFERENCES "peoples"("id") ON DELETE CASCADE;