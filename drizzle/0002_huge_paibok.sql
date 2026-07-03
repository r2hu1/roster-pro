ALTER TABLE "menu" ALTER COLUMN "id" SET DEFAULT 'c71c0c7d-731c-4b6f-8afa-ca8dfdf2aa54';--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DEFAULT 'fc0960d8-539c-4edc-89e4-43adb6e1d6ee';--> statement-breakpoint
ALTER TABLE "table" ALTER COLUMN "id" SET DEFAULT 'f1f537bc-06a5-4c84-ba33-11ab9f1f192e';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DEFAULT 'eb3f1773-d364-47ea-9a9d-1c0f3438eed0';--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DEFAULT '6eb0689c-519b-4efb-8506-8731ef6dec73';--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "status" text NOT NULL;