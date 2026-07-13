import { ViewTypeProvider } from "@/modules/menu/views/providers/view-type"
import MenuPageView from "@/modules/menu/views/ui/menu-page-view"
import ResponsiveOrdersStatus from "@/modules/orders/views/ui/responsive-orders-status"
import { Metadata } from "next"

export default function Page() {
  return (
    <ViewTypeProvider>
      <MenuPageView />
      <ResponsiveOrdersStatus/>
    </ViewTypeProvider>
  )
}
