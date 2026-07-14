import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import type { TableStatus } from "@workspace/shared/enums/index"
import { organization } from "./auth.js"
import { v4 as uuidv4 } from "uuid"

export const tableSchema = pgTable(
  "table",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
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

export const tableSession = pgTable(
  "table_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    tableId: text("table_id")
      .notNull()
      .references(() => tableSchema.id, {
        onDelete: "cascade",
      }),
    tableNumber: text("table_number").notNull(),
    status: text("status").$type<"active" | "completed">().default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    idIdx: index("table_session_id_idx").on(table.id),
    orgIdx: index("table_session_org_idx").on(table.organizationId),
    tableIdIdx: index("table_session_table_id_idx").on(table.tableId),
  })
)

