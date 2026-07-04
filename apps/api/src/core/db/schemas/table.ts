import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { organization } from "./auth.js"
import { v4 as uuidv4 } from "uuid"

export type TableStatus = "available" | "occupied"

export const tableSchema = pgTable(
  "table",
  {
    id: text("id").primaryKey().default(uuidv4()),
    number: integer().notNull(),
    name: text(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    status: text("status").$type<TableStatus>().notNull(),
    qrToken: text("qr_token"),
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
