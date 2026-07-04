"use client"
import { authClient } from "@/lib/better-auth/client"

export default function Page() {
  const session = authClient.useSession();
  if (!session) {
    return <div>Not authenticated</div>
  }

  return <div>{session.error?.message}</div>
}
