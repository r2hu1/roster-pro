ALTER TABLE "menu" ALTER COLUMN "id" SET DEFAULT '9af5d99b-c52b-48b1-baaf-479fbb6c8481';--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" SET DEFAULT '59ad06e4-2ee9-4c09-b2d3-c1aba1afeb62';--> statement-breakpoint
ALTER TABLE "table" ALTER COLUMN "id" SET DEFAULT '8a9dcb46-fe49-4584-81d6-d05d6c1fdf05';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" SET DEFAULT 'b246fdcd-a588-4929-90a3-f65d9c460e0c';--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" SET DEFAULT 'e076fb53-db8d-46ce-843c-1b76c0b9ddee';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "gstin" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "number" text;