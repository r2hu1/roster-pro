import { redirect } from "next/navigation"

export default function Page() {
  return redirect(process.env.NEXT_PUBLIC_MARKETING_URL!)
}
