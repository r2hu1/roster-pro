import { authClient } from "@/lib/better-auth/client"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page() {
  const incomingHeaders = await headers()
  const requestHeaders = { cookie: incomingHeaders.get("cookie") ?? "" }

  const { data: session, error: sessionError } = await authClient.getSession({
    fetchOptions: {
      headers: requestHeaders,
    },
  })

  if (sessionError || !session?.session) {
    redirect("/login-or-signup")
  }

  const { data: organizations, error: organizationError } =
    await authClient.organization.list({
      fetchOptions: {
        headers: requestHeaders,
      },
    })

  if (organizationError) {
    throw organizationError
  }

  const organization = organizations?.[0]

  if (!organization) {
    redirect("/onboarding")
  }

  const { data: subscriptions, error: subscriptionError } =
    await authClient.customer.subscriptions.list({
      fetchOptions: {
        headers: requestHeaders,
      },
      query: {
        active: true,
        referenceId: organization.id,
      },
    })

  if (
    subscriptionError ||
    subscriptions?.result?.pagination?.totalCount === 0
  ) {
    redirect("/onboarding/subscription")
  }

  redirect(`/${organization.id}`)
}
