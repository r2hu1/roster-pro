import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';

import { organization } from './auth.js';
import { menuItem } from './menu.js';
import type { MenuItem } from '@workspace/shared/types/organization/menu/types';


type Status =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export const order = pgTable(
  'order',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade',
      }),
    customerName: text('customer_name'),
    customerPhone: text('customer_phone'),
    customerEmail: text('customer_email'),
    tableNumber: text('table_number'),
    status: text('status')
      .$type<Status>()
      .default('pending')
      .notNull(),
    paymentStatus: text('payment_status')
      .$type<PaymentStatus>()
      .default('pending')
      .notNull(),
    totalAmount: integer('total_amount').notNull(),
    notes: text('notes'),
    items: jsonb('items').$type<MenuItem[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    idIdx: index('order_id_idx').on(table.id),
    orgIdx: index('order_org_idx').on(table.organizationId),
    statusIdx: index('order_status_idx').on(table.status),
    customerEmailIdx: index('order_customer_email_idx').on(table.customerEmail),
    paymentStatusIdx: index('order_payment_status_idx').on(
      table.paymentStatus,
    ),
    createdAtIdx: index('order_created_at_idx').on(table.createdAt),
  }),
);

export const orderItem = pgTable(
  'order_item',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => order.id, {
        onDelete: 'cascade',
      }),
    menuItemId: text('menu_item_id')
      .notNull()
      .references(() => menuItem.id),
    quantity: integer('quantity').default(1).notNull(),
    unitPrice: integer('unit_price').notNull(),
    totalPrice: integer('total_price').notNull(),
    notes: text('notes'),
  },
  (table) => ({
    orderIdx: index('order_item_order_idx').on(table.orderId),
    menuItemIdx: index('order_item_menu_item_idx').on(table.menuItemId),
  }),
);
