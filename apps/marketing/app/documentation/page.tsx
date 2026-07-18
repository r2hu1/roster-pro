import DocumentationPageView from "@/modules/pages/views/ui/documentation-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use RosterPro with guides and examples.",
}

export default function Page() {
  return <DocumentationPageView />
}
