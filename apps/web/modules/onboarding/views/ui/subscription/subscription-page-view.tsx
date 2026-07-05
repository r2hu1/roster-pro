"use client"

import { authClient } from "@/lib/better-auth/client"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"

export default function SubscriptionPageView() {
  const org = authClient.useListOrganizations()
  const handleSubscribe = async () => {
    try {
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
    }
  }
  return (
    <div>
      <Button size="lg" onClick={handleSubscribe}>
        Subscribe
      </Button>
    </div>
  )
}
