"use client"

import { Logo } from "@/components/logo"
import { authClient } from "@/lib/better-auth/client"
import { IconCheck, IconArrowRight } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const trialFeatures = [
  "Up to 50 orders per month",
  "QR menu & ordering",
  "Basic dashboard",
  "Single user",
  "Email support",
  "7-day free trial",
]

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

export default function SubscriptionPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const org = authClient.useListOrganizations()

  const handleFreeTrial = () => {
    router.push("/onboarding/success")
  }

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      if (!org.data)
        return toast.error("Unauthorized, please setup your restaurant first.")
      await authClient.checkout({
        slug: "pro",
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

  return (
    <section className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <div className="flex flex-col items-center text-center mb-12">
            <Logo className="mb-6 h-10 w-auto" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Choose your plan
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start with a basic trial pack or go premium for the full experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Trial Plan */}
            <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Trial Pack</h2>
                  <p className="text-sm text-muted-foreground">For 60 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">70% off on Premium</p>
                  <p className="text-xs text-muted-foreground">then ₹2999/mo</p>
                </div>
              </div>
              <ul className="mb-5 space-y-2">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCheck className="size-3.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleFreeTrial}
                className="w-full h-10"
                size="lg"
              >
                Start Trial
                <IconArrowRight className="size-3.5" />
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="relative rounded-xl border-2 border-primary bg-card p-6 transition-all duration-200 hover:shadow-md">
              <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                Popular
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Premium</h2>
                  <p className="text-sm text-muted-foreground">Full access</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">₹2999</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              <ul className="mb-5 space-y-2">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCheck className="size-3.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full h-10"
                size="lg"
              >
                {loading ? <Loader /> : "Subscribe Now"}
                {!loading && <IconArrowRight className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 pb-8 flex justify-center">
        <Image
          alt="subscription"
          src="/assets/scanning-qr-stand.jpeg"
          height={400}
          width={800}
          className="w-full max-w-5xl rounded-xl object-contain"
        />
      </div>

      <footer className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        <p>&copy; 2026 RosterPro. All rights reserved.</p>
        <div className="mt-1 flex justify-center gap-4">
          <a href="/terms&cond" className="hover:text-foreground transition-colors">Terms</a>
          <a href="/privacy_policy" className="hover:text-foreground transition-colors">Privacy</a>
        </div>
      </footer>
    </section>
  )
}
