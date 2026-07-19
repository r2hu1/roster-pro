ALTER TABLE "menu_item" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "menu_item_featured_idx" ON "menu_item" USING btree ("is_featured");
