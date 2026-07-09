import type { Metadata } from "next"
import ReceiptsPageView from "@/modules/receipts/views/ui/receipts-page-view"

export const metadata: Metadata = {
  title: "Receipts",
  description: "Browse all your restaurants receipts.",
}

export default function Page() {
  return <ReceiptsPageView />
}
