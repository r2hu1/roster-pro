import type { Metadata } from "next"
import PrivacyPolicyPageView from "@/modules/pages/views/ui/privacy-policy-page-view"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Our privacy policy outlines how we handle your data and privacy.",
}

export default function Page() {
  return <PrivacyPolicyPageView />
}
