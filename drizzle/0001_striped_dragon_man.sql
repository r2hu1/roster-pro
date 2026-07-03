ALTER TABLE "menu" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "menu" ALTER COLUMN "id" SET DEFAULT 'a7658e57-5c8f-444f-8b25-9593dc3a85c3';--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DEFAULT 'e328f222-aa39-4e11-907b-c77cc98488c7';--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "menu_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "table" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "table" ALTER COLUMN "id" SET DEFAULT '03f86d4b-f18a-4d6c-9fd5-3e4364e9e700';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DEFAULT '71f38548-0766-4ab1-a4c5-a2da444a746d';--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DEFAULT 'de607d9f-53c7-416f-8577-8c43766a1744';--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "order_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "menu_item_id" SET DATA TYPE text;