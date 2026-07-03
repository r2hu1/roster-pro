import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core"
import { organization } from "./auth.js"
import { v4 as uuidv4 } from "uuid";

export const menu = pgTable(
  "menu",
  {
    id: text("id").primaryKey().default(uuidv4()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => ({
    idIdx: index("menu_id_idx").on(table.id),
    orgIdx: index("menu_org_idx").on(table.organizationId),
    activeIdx: index("menu_active_idx").on(table.isActive),
  })
)

export const menuItem = pgTable(
  "menu_item",
  {
    id: text("id").primaryKey().default(uuidv4()),
    menuId: text("menu_id")
      .notNull()
      .references(() => menu.id, {
        onDelete: "cascade",
      }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    description: text("description"),
    ingredients: text("ingredients").array(),
    price: integer("price").notNull(),
    image: text("image"),
    imageKey: text("image_key"),
    category: text("category"),
    isAvailable: boolean("is_available").default(true).notNull(),
    isVegetarian: boolean("is_vegetarian").default(false).notNull(),
    preparationTime: integer("preparation_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    idIdx: index("menu_item_id_idx").on(table.id),
    menuIdx: index("menu_item_menu_idx").on(table.menuId),
    categoryIdx: index("menu_item_category_idx").on(table.category),
    availableIdx: index("menu_item_available_idx").on(table.isAvailable),
    vegetarianIdx: index("menu_item_vegetarian_idx").on(table.isVegetarian),
  })
)
