import TablesPageView from "@/modules/tables/views/ui/tables-page-view"
import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tables",
  description: "Manage your tables, view orders, and more in realtime.",
}

export default function Page() {
  return <TablesPageView />
}
