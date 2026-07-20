ALTER TABLE "table" ADD COLUMN "qr_token_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "menu_item_featured_idx" ON "menu_item" USING btree ("is_featured");