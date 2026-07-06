import { AnalyticsPageView } from "@/modules/analytics/views/ui/analytics-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Live analytics, watch how's your restaurant doing.",
}

export default function Page() {
  return <AnalyticsPageView />
}
