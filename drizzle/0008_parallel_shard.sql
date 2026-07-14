CREATE TABLE "table_session" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"table_id" text NOT NULL,
	"table_number" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "table_session_id" text;--> statement-breakpoint
ALTER TABLE "table_session" ADD CONSTRAINT "table_session_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_session" ADD CONSTRAINT "table_session_table_id_table_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "table_session_id_idx" ON "table_session" USING btree ("id");--> statement-breakpoint
CREATE INDEX "table_session_org_idx" ON "table_session" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "table_session_table_id_idx" ON "table_session" USING btree ("table_id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_table_session_id_table_session_id_fk" FOREIGN KEY ("table_session_id") REFERENCES "public"."table_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_table_session_idx" ON "order" USING btree ("table_session_id");