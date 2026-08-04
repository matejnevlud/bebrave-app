CREATE TABLE "payment_refunds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_refunds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"reservationId" integer NOT NULL,
	"captureOperationId" varchar(255) NOT NULL,
	"refundOperationId" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" varchar(50) DEFAULT 'requested' NOT NULL,
	"description" varchar(500),
	"idempotencyKey" varchar(255) NOT NULL,
	"requestedBy" varchar(255) NOT NULL,
	"error" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "payment_refunds_idempotencyKey_unique" UNIQUE("idempotencyKey")
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "paymentOperationId" varchar(255);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "refundedAmount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vouchers" ADD COLUMN IF NOT EXISTS "slevomatRedeemedAt" timestamp;
