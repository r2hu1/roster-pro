import type { OrderStatus } from "@workspace/shared/enums"

export const filters: { label: string; value: "All" | OrderStatus }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

export const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-orange-100 text-orange-800 border-orange-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  served: "bg-teal-100 text-teal-800 border-teal-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

export const paymentStyles: Record<string, string> = {
  pending: "text-yellow-600",
  paid: "text-emerald-600",
  failed: "text-red-600",
  refunded: "text-purple-600",
}
