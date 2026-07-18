import ContactPageView from "@/modules/pages/views/ui/contact-page-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact us for any inquiries or support.",
}

export default function Page() {
  return <ContactPageView />
}
