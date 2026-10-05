ALTER TABLE "categories" DROP CONSTRAINT "categories_name_key";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "type" "transaction_type" DEFAULT 'expense'::"transaction_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "icon" text DEFAULT 'Tag' NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "color" SET DEFAULT '#3B82F6';--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_type_unique" ON "categories" ("name","type");