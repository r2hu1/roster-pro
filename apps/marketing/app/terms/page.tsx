import TermsAndConditionsPageView from "@/modules/pages/views/ui/terms-and-cond-page-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read our terms and conditions, and learn how we handle your data.",
}

export default function Page() {
  return <TermsAndConditionsPageView />
}
