"use client"

import { Logo } from "@/components/logo"
import { authClient } from "@/lib/better-auth/client"
import { IconCheck, IconArrowRight, IconCalendar } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"
import { useState } from "react"
import { Switch } from "@workspace/ui/components/switch"
import Image from "next/image"
import { ArrowRight, Calendar, CheckCircle } from "reicon-react"

const premiumFeatures = [
  "Unlimited orders",
  "QR menu & ordering",
  "Kitchen display system",
  "Table management",
  "GST-compliant billing",
  "Live analytics & reports",
  "Unlimited staff accounts",
  "Priority support",
  "Inventory management",
]

const MONTHLY_PRICE = 2999
const YEARLY_PRICE = 32000
const YEARLY_DISCOUNT_PCT = Math.round(
  (1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100
)

export default function SubscriptionPageView() {
  const [loading, setLoading] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const org = authClient.useListOrganizations()

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      if (!org.data)
        return toast.error("Unauthorized, please setup your restaurant first.")
      await authClient.checkout({
        slug: isYearly ? "pro-yearly" : "pro",
        referenceId: org.data[0]?.id,
        redirect: true,
        successUrl: process.env.NEXT_PUBLIC_APP_URL + "/onboarding/success",
        returnUrl: process.env.NEXT_PUBLIC_APP_URL + "/",
        allowDiscountCodes: true,
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleDemo = () => {
    window.open("https://cal.com/roster-pro/product-demo-possible-partnership", "_blank")
  }

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />{" "}
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="mb-2 h-12" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Choose your plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything you need to run your restaurant, on one plan.
          </p>
        </div>

        <div className="relative rounded-xl border border-primary/20 bg-card p-6">
          {isYearly && (
            <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
              Save {YEARLY_DISCOUNT_PCT}%
            </div>
          )}

          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Premium</h2>
              <p className="text-sm text-muted-foreground">Full access</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-colors ${
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span
                className={`text-sm font-medium transition-colors ${
                  isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
              </span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-4xl font-bold text-foreground">
              ₹{isYearly ? YEARLY_PRICE.toLocaleString("en-IN") : MONTHLY_PRICE}
            </p>
            <p className="text-sm text-muted-foreground">
              {isYearly ? "Per Year" : "Per Month"}
            </p>
          </div>

          <ul className="mb-5 space-y-2">
            {premiumFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle className="size-3.5 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm font-medium text-primary">
              <IconArrowRight className="size-3.5 shrink-0" />+ many more
            </li>
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="h-10 w-full"
            size="lg"
          >
            Subscribe Now
            {loading ? <Loader /> : <ArrowRight className="size-3.5" />}
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Want a demo before subscribing?
            </p>
            <p className="text-xs text-muted-foreground">
              We{"'"}ll walk you through it, no price attached.
            </p>
          </div>
          <Button
            onClick={handleScheduleDemo}
            variant="outline"
            className="shrink-0 gap-1.5"
          >
            <Calendar className="size-3.5" />
            Schedule call
          </Button>
        </div>
      </div>
    </section>
  )
}
