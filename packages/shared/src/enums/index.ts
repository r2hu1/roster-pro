import { z } from "zod"

export const OrderStatus = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
])

export type OrderStatus = z.infer<typeof OrderStatus>

export const PaymentStatus = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
])

export type PaymentStatus = z.infer<typeof PaymentStatus>

export const TableStatus = z.enum(["available", "occupied"])

export type TableStatus = z.infer<typeof TableStatus>

export const Role = z.enum(["owner", "admin", "member"])

export type Role = z.infer<typeof Role>
