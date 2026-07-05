import type { Metadata } from "next"
import OnboardingPageView from "@/modules/onboarding/views/ui/onboarding-page-view"

export const metadata: Metadata = {
  title: "Setup your restaurant",
  description: "To get started setup your restaurnat.",
}

export default function Page() {
  return <OnboardingPageView />
}
