ALTER TYPE "transaction_link_type" ADD VALUE 'self_transfer';--> statement-breakpoint
ALTER TYPE "transaction_link_type" ADD VALUE 'cash_withdrawal';--> statement-breakpoint
ALTER TABLE "transaction_links" ADD CONSTRAINT "transaction_links_no_self_link" CHECK ("transaction_id" <> "linked_transaction_id");