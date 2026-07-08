import type { OrderStatus } from "@workspace/shared/enums"

export const filters: { label: string; value: "All" | OrderStatus }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

// Legacy badge style (bg + text + border) — keep if used elsewhere
export const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-800",
  confirmed: "bg-blue-100 text-blue-800 border-blue-800",
  preparing: "bg-orange-100 text-orange-800 border-orange-800",
  ready: "bg-green-100 text-green-800 border-green-800",
  served: "bg-teal-100 text-teal-800 border-teal-800",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-800",
  cancelled: "bg-red-100 text-red-800 border-red-800",
}

// Dot color for the pill indicator
export const statusDotStyles: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-orange-500",
  ready: "bg-green-500",
  served: "bg-teal-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
}

// Text color for the pill label
export const statusTextStyles: Record<string, string> = {
  pending: "text-yellow-700",
  confirmed: "text-blue-700",
  preparing: "text-orange-700",
  ready: "text-green-700",
  served: "text-teal-700",
  completed: "text-emerald-700",
  cancelled: "text-red-700",
}

export const paymentStyles: Record<string, string> = {
  pending: "text-yellow-600",
  paid: "text-emerald-600",
  failed: "text-red-600",
  refunded: "text-purple-600",
}
