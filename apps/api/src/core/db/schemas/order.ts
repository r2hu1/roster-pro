import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core"

import { organization } from "./auth.js"
import type { OrderStatus, PaymentStatus } from "@workspace/shared/enums"
import type { CreateOrderItemDto } from "@workspace/shared/schemas/order/order-item/index"

import { v4 as uuidv4 } from "uuid"
import { menuItem } from "./menu.js"

export type OrderItemJson = Omit<CreateOrderItemDto, "id" | "orderId">

export const order = pgTable(
  "order",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    customerEmail: text("customer_email"),
    tableNumber: text("table_number").notNull(),
    status: text("status").$type<OrderStatus>().default("pending").notNull(),
    paymentStatus: text("payment_status")
      .$type<PaymentStatus>()
      .default("pending")
      .notNull(),
    paymentMethod: text("payment_method"),
    items: jsonb("items").$type<OrderItemJson[]>().notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").default(0).notNull(),
    taxableAmount: integer("taxable_amount").notNull(),
    cgstAmount: integer("cgst_amount").default(0).notNull(),
    sgstAmount: integer("sgst_amount").default(0).notNull(),
    igstAmount: integer("igst_amount").default(0).notNull(),
    roundOff: integer("round_off").default(0).notNull(),
    grandTotal: integer("grand_total").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    idIdx: index("order_id_idx").on(table.id),
    invoiceIdx: index("order_invoice_idx").on(table.invoiceNumber),
    orgIdx: index("order_org_idx").on(table.organizationId),
    statusIdx: index("order_status_idx").on(table.status),
    paymentStatusIdx: index("order_payment_status_idx").on(table.paymentStatus),
    createdAtIdx: index("order_created_at_idx").on(table.createdAt),
    customerEmailIdx: index("order_customer_email_idx").on(table.customerEmail),
  })
)

export const orderItem = pgTable(
  "order_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, {
        onDelete: "cascade",
      }),
    menuItemId: text("menu_item_id")
      .notNull()
      .references(() => menuItem.id),
    variant: text("variant").$type<"half" | "full">().notNull(),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: integer("unit_price").notNull(),
    notes: text("notes"),
  },
  (table) => ({
    orderIdx: index("order_item_order_idx").on(table.orderId),
    menuItemIdx: index("order_item_menu_item_idx").on(table.menuItemId),
  })
)

export const orderCounter = pgTable(
  "order_counter",
  {
    organizationId: text("organization_id").notNull(),
    year: integer("year").notNull(),
    lastSequence: integer("last_sequence").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.organizationId, table.year] }),
  })
)
