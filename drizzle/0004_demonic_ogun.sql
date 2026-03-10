CREATE TABLE "vouchers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vouchers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(20) NOT NULL,
	"classTypeId" integer,
	"status" varchar(20) DEFAULT 'available',
	"validFrom" timestamp DEFAULT now() NOT NULL,
	"validUntil" timestamp NOT NULL,
	"usedAt" timestamp,
	"reservationId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "class_types" ADD COLUMN "isShownAsPromo" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "class_types" ADD COLUMN "isVoucherEligible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "voucherId" integer;