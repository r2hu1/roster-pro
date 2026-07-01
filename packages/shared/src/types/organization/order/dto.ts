import type { MenuItem } from "../menu/types";
import type { OrderStatus, PaymentStatus } from "./types";

export interface CreateOrderDto {
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  tableNumber: string;
  status?: OrderStatus;
  items?: MenuItem[];
  paymentStatus?: PaymentStatus;
  totalAmount: number;
  notes?: string | null;
}

export interface UpdateOrderDto {
  id: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  tableNumber: string;
  status?: OrderStatus;
  items?: MenuItem[];
  paymentStatus?: PaymentStatus;
  totalAmount?: number;
  notes?: string | null;
}
