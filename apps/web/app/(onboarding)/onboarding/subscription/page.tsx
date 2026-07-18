import type { Metadata } from "next"
import SubscriptionPageView from "@/modules/onboarding/views/ui/subscription/subscription-page-view"

export const metadata: Metadata = {
  title: "Upgrade To RosterPro",
  description: "Everything you need to run your restaurant, on one plan.",
}

export default function SubscriptionPage() {
  return <SubscriptionPageView />
}
