"use client"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useRouter } from "next/navigation"
import React, { useCallback, useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import SuccessRippleAnimation from "@/components/success-ripple"

export default function SuccessDialog({
  isOrderSuccessful,
  setIsOrderSuccessful,
  tableNumber,
  orderId,
}: {
  isOrderSuccessful: boolean
  setIsOrderSuccessful: React.Dispatch<React.SetStateAction<boolean>>
  tableNumber?: string
  orderId?: string
}) {
  const hasFired = useRef(false)
  const router = useRouter()

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
    if (isOrderSuccessful) {
      handleFireConfetti()
    }
  }, [isOrderSuccessful])

  return (
    <Dialog open={isOrderSuccessful} onOpenChange={setIsOrderSuccessful}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-6 pt-10"
      >
        <div className="flex items-center justify-center">
          <SuccessRippleAnimation />
        </div>

        <DialogHeader className="gap-2">
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Order <span className="text-primary">placed!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            Our chefs are getting started — we'll bring it out fresh, as quickly
            as we can.
          </DialogDescription>
        </DialogHeader>

        {(tableNumber || orderId) && (
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
            {tableNumber && (
              <span className="text-muted-foreground">
                Table{" "}
                <span className="font-semibold text-foreground">
                  {tableNumber}
                </span>
              </span>
            )}
            {tableNumber && orderId && <span className="text-border">|</span>}
            {orderId && (
              <span className="text-muted-foreground">
                Order{" "}
                <span className="font-semibold text-foreground">
                  #{orderId}
                </span>
              </span>
            )}
          </div>
        )}

        <Button
          onClick={() => {
            setIsOrderSuccessful(false)
            router.push("/order")
          }}
          className="w-full rounded-full py-6 text-base font-semibold"
        >
          Track Order
        </Button>
      </DialogContent>
    </Dialog>
  )
}
