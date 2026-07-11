ALTER TABLE "order" ALTER COLUMN "gst_rate" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "cgst_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "sgst_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "igst_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "round_off" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "grand_total" SET DATA TYPE numeric(10, 2);