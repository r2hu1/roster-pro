import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { organization } from "./auth.js"

export const tableSchema = pgTable(
  "table",
  {
    id: uuid().defaultRandom().primaryKey(),
    number: integer().notNull(),
    name: text(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => ({
    idIdx: index("table_id_idx").on(table.id),
    organizationIdIdx: index("table_organization_id_idx").on(
      table.organizationId
    ),
  })
)
