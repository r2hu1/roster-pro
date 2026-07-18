"use client"

import { authClient } from "@/lib/better-auth/client"
import { useQuery } from "@tanstack/react-query"
import { getSubscriptions } from "../../api/get-subscriptions"
import { useSession } from "@/modules/providers/session-provider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { IconCreditCard, IconExternalLink, IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react"

export default function SubscriptionSettings() {
  const { organization, isLoading } = useSession()

  const { data: subscription, isPending } = useQuery({
    queryKey: ["subscription"],
    enabled: !!organization,
    queryFn: async () => {
      const req = await getSubscriptions(organization?.id ?? "")
      return req
    },
  })

  const sub = subscription?.data?.result?.items?.[0]

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading subscription...</p>
      </div>
    )
  }

  if (!sub) {
    return (
      <Card className="max-w-lg rounded-sm!">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>Subscribe to unlock all features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have an active subscription. Choose a plan to get started.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href={`/${organization?.id}/subscribe`}>
              <IconCreditCard />
              View Plans
            </a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    past_due: "destructive",
    canceled: "secondary",
    incomplete: "outline",
  }

  const subRaw = sub as { customer?: { billingAddress?: { line1?: string; line2?: string | null; city?: string; state?: string; postalCode?: string; country?: string } } }
  const billingAddress = subRaw.customer?.billingAddress

  const price = sub.prices?.[0]
  const priceAmount = price && "priceAmount" in price ? price.priceAmount : sub.amount ?? 0
  const currency = sub.currency ?? "inr"
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(priceAmount / 100)

  const nextBilling = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const period = sub.recurringInterval === "year" ? "yr" : "mo"

  return (
    <Card className="rounded-lg!">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{sub.product?.name ?? "Subscription"}</CardTitle>
            <CardDescription>
              {formattedPrice}/{period}
            </CardDescription>
          </div>
          <Badge variant={statusColor[sub.status] ?? "outline"}>
            {sub.status === "active" && sub.cancelAtPeriodEnd
              ? "Cancelling"
              : sub.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {sub.status === "active" ? (
            <IconCircleCheck className="size-4 shrink-0" />
          ) : (
            <IconAlertTriangle className="size-4 shrink-0" />
          )}
          <span>
            {sub.status === "active"
              ? sub.cancelAtPeriodEnd
                ? "Cancels at period end"
                : "Active"
              : sub.status === "past_due"
                ? "Payment overdue"
                : `Status: ${sub.status}`}
          </span>
        </div>
        {nextBilling && sub.status === "active" && !sub.cancelAtPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            Next billing: {nextBilling}
          </p>
        )}
        {sub.cancelAtPeriodEnd && sub.currentPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            Access until: {nextBilling}
          </p>
        )}
        {billingAddress && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">Billing Address</p>
            <p className="text-sm">
              {billingAddress.line1}
              {billingAddress.line2 && <>, {billingAddress.line2}</>}
              <br />
              {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
              <br />
              {billingAddress.country}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          onClick={async () => {
            await authClient.customer.portal()
          }}
        >
          <IconExternalLink />
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  )
}
