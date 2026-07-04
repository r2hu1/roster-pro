CREATE TABLE "order_counter" (
	"organization_id" text NOT NULL,
	"year" integer NOT NULL,
	"last_sequence" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "order_counter_organization_id_year_pk" PRIMARY KEY("organization_id","year")
);
--> statement-breakpoint
ALTER TABLE "menu" ALTER COLUMN "id" SET DEFAULT '59a192ec-c4dd-4cb2-ab5c-68a4acea3a40';--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DEFAULT 'ea6a2ab7-0e24-49f8-a335-169a232d43df';--> statement-breakpoint
ALTER TABLE "table" ALTER COLUMN "id" SET DEFAULT '5a3f8ff3-9973-42a0-b613-1b694bd4fe3e';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DEFAULT '7e372838-8188-4ff3-86fb-aa7130374318';--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DEFAULT '58bb1c6a-a53d-4463-814b-1799640df37f';