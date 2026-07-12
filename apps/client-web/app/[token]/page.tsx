import { ViewTypeProvider } from "@/modules/menu/views/providers/view-type"
import MenuPageView from "@/modules/menu/views/ui/menu-page-view"
import { Metadata } from "next"

export default function Page() {
  return (
    <ViewTypeProvider>
      <MenuPageView />
    </ViewTypeProvider>
  )
}
