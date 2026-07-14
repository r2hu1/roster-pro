"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { authClient } from "@/lib/better-auth/client"
import { useSession } from "./session-provider"
import Preloader from "@/components/preloader"

interface Props {
  children: React.ReactNode
}

export default function SubscriptionMiddleware({ children }: Props) {
  const router = useRouter()
  const { organization } = useSession()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["subscription", organization?.id],
    enabled: !!organization?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const res = await authClient.customer.subscriptions.list({
        query: {
          referenceId: organization!.id,
          active: true,
          page: 1,
          limit: 1,
        },
      })

      if (res.error) {
        throw new Error(res.error.message)
      }

      return res.data
    },
  })

  const hasSubscription = useMemo(() => {
    return (data?.result.items.length ?? 0) > 0
  }, [data])

  const shouldRedirect =
    !!organization && !isPending && !isError && !hasSubscription

  useEffect(() => {
    if (!shouldRedirect) return

    router.replace(`/${organization!.id}/subscribe`)
  }, [shouldRedirect, organization, router])

  if (!organization) {
    return <Preloader />
  }

  if (isPending) {
    return <Preloader />
  }

  if (isError) {
    console.error(error)

    return (
      <div className="flex min-h-screen items-center justify-center">
        Failed to verify your subscription.
      </div>
    )
  }

  if (shouldRedirect) {
    return <Preloader />
  }

  return children
}
