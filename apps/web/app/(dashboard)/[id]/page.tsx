import OrdersPageView from "@/modules/orders/views/ui/orders-page-view"
import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Orders",
  description: "All your orders in realtime.",
}

export default function Page() {
  return <OrdersPageView />
}
