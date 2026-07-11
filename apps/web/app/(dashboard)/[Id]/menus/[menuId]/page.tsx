import type { Metadata } from "next"
import MenuItemsPageView from "@/modules/menus/views/ui/menu-item/menu-item-page-view"

export const metadata: Metadata = {
  title: "Menu Items",
  description: "View and manage your menu items",
}

export default function Page() {
  return <MenuItemsPageView />
}
