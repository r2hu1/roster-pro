import type { OrderStatus, PaymentStatus } from "./types";

export interface CreateOrderDto {
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  tableNumber?: string | null;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  totalAmount: number;
  notes?: string | null;
}

export interface UpdateOrderDto {
  id: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  tableNumber?: string | null;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  totalAmount?: number;
  notes?: string | null;
}
