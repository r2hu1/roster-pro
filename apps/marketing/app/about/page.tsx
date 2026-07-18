import type { Metadata } from "next"
import AboutPageView from "@/modules/pages/views/ui/about-page-view"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our company and what we do.",
}

export default function Page() {
  return <AboutPageView />
}
