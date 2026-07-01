CREATE TABLE "menu" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_item" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"ingredients" text[],
	"price" integer NOT NULL,
	"image" text,
	"image_key" text,
	"category" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_vegetarian" boolean DEFAULT false NOT NULL,
	"preparation_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "menu_id_idx" ON "menu" USING btree ("id");--> statement-breakpoint
CREATE INDEX "menu_org_idx" ON "menu" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "menu_active_idx" ON "menu" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "menu_item_id_idx" ON "menu_item" USING btree ("id");--> statement-breakpoint
CREATE INDEX "menu_item_menu_idx" ON "menu_item" USING btree ("menu_id");--> statement-breakpoint
CREATE INDEX "menu_item_category_idx" ON "menu_item" USING btree ("category");--> statement-breakpoint
CREATE INDEX "menu_item_available_idx" ON "menu_item" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "menu_item_vegetarian_idx" ON "menu_item" USING btree ("is_vegetarian");