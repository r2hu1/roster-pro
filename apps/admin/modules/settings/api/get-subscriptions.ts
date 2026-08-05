"use server"
import { authClient } from "@/lib/better-auth/client"
import { headers } from "next/headers"

export async function getSubscriptions(id: string) {
  const incomingHeaders = await headers()
  const requestHeaders = { cookie: incomingHeaders.get("cookie") ?? "" }

  const req = await authClient.customer.subscriptions.list({
    fetchOptions: {
      headers: requestHeaders,
    },
    query: {
      active: true,
      referenceId: id,
    },
  })
  return req
}
