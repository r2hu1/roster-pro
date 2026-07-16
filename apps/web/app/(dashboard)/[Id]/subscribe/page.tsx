import SubscriptionPageView from "@/modules/onboarding/views/ui/subscription/subscription-page-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upgrade to Pro",
  description: "Upgrade to Pro to access all features and benefits.",
}

export default function SubscribePage() {
  return <SubscriptionPageView />
}
