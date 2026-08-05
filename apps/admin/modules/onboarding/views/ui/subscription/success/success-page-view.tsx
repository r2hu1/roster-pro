"use client"

import SuccessRippleAnimation from "@/components/success-ripple"
import { authClient } from "@/lib/better-auth/client"
import { IconArrowUpRight } from "@tabler/icons-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { cn } from "@workspace/ui/lib/utils"
import confetti from "canvas-confetti"
import Link from "next/link"
import { useCallback, useEffect, useRef } from "react"

export default function ConfirmBookingPageView() {
  const hasFired = useRef(false)
  const { data, isPending } = authClient.useListOrganizations()

  const handleFireConfetti = useCallback(() => {
    if (hasFired.current) return
    hasFired.current = true

    const end = Date.now() + 3000
    const colors = ["#d99007", "#fd8bbc", "#eca184", "#f8deb1"]

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      })

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      })

      requestAnimationFrame(frame)
    }

    frame()
  }, [])
  useEffect(() => {
    if (isPending) return
    handleFireConfetti()
  }, [isPending])
  if (isPending)
    return (
      <div className="flex items-center justify-center absolute inset-0">
        <Loader />
      </div>
    )

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full text-center max-w-sm rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-center -mt-6">
            <SuccessRippleAnimation />
          </div>

          <h1 className="text-[22px] font-semibold tracking-tight text-stone-900 leading-snug">
            Congratulations!
          </h1>

          <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
            You are all set to modernize your restaurant experience.
          </p>
        </div>

        <div className="px-8 pb-8 flex gap-2 justify-center">
          <Link
            href={`/${data?.[0]?.id}`}
            className={cn(
              buttonVariants({
                size: "lg",
                // className:"bg-foreground! text-background!"
              })
            )}
          >
            Continue to dashboard
            <IconArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
