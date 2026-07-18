"use client"
import { authClient } from "@/lib/better-auth/client"
import { useQuery } from "@tanstack/react-query"
import { getSubscriptions } from "../../api/get-subscriptions"
import { useSession } from "@/modules/providers/session-provider"

export default function SubscriptionSettings() {
  const { organization, isLoading } = useSession()

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    enabled: !!organization,
    queryFn: async () => {
      const req = await getSubscriptions(organization?.id ?? "")
      return req
    },
  })
  return <div></div>
}
