import type { MenuItem } from "../menu/types";

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Order {
  id: string;
  organizationId: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  tableNumber: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: MenuItem[];
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
