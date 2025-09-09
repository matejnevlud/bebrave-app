ALTER TABLE "class_types" ADD COLUMN "customEmailMessage" varchar(1000);--> statement-breakpoint
ALTER TABLE "class_types" ADD COLUMN "homepageText" text;--> statement-breakpoint
ALTER TABLE "class_types" ADD COLUMN "isShownOnHomepage" boolean DEFAULT false;