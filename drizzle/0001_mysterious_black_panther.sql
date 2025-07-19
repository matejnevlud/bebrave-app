ALTER TABLE "invoices"
    ADD COLUMN "duzp" timestamp;--> statement-breakpoint
ALTER TABLE "invoices"
    ADD COLUMN "paymentMethod" varchar(50);