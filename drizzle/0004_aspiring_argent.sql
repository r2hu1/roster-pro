ALTER TABLE "organization" ADD COLUMN "gst_rate" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "gst_rate" integer DEFAULT 0 NOT NULL;