import { redirect } from "next/navigation"

export default async function Page() {
  const session = await fetch("/user/me")
  if (!session) {
    return redirect("/login")
  }

  return "E"
}
