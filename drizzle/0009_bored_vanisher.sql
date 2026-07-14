ALTER TABLE "order" ALTER COLUMN "subtotal" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "discount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "taxable_amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
CREATE INDEX "table_session_org_table_status_idx" ON "table_session" USING btree ("organization_id","table_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "table_session_active_idx" ON "table_session" USING btree ("table_id") WHERE "table_session"."status" = 'active';