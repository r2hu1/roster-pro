"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import SuccessRippleAnimation from "@/components/success-ripple"
import { qrTokenStorage } from "@/hooks/use-qr-session"

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    qrTokenStorage.clearRouteToken()
    qrTokenStorage.clearPendingToken()
  }, [])

  return (
    <main className="min-h-svh flex flex-col items-center justify-center gap-6 px-6 text-center">
      <SuccessRippleAnimation />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Thank you for visiting!</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your table session has ended. We hope you enjoyed your meal see you
          again soon.
        </p>
      </div>
      <Button size="lg" onClick={() => router.replace("/")}>
        Scan to order again
      </Button>
    </main>
  )
}
