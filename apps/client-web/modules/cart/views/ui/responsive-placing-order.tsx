"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import confetti from "canvas-confetti"
import { useCreateTableOrder } from "@/hooks/use-create-table-order"
import SuccessRippleAnimation from "@/components/success-ripple"
import { useTableContext } from "@/modules/providers/table-provider"
import { useCart } from "@/modules/cart/views/provider/cart-provider"
import { Button } from "@workspace/ui/components/button"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
} from "@workspace/ui/components/responsive-modal"
import Image from "next/image"

interface Props {
  children: React.ReactNode
  orderNotes?: string
}

type Phase = "confirm" | "placing" | "success" | "error"

const CONFETTI_COLORS = ["#d99007", "#fd8bbc", "#eca184", "#f8deb1"]
const CONFETTI_DURATION_MS = 3000

export default function ResponsivePlacingOrder({
  children,
  orderNotes,
}: Props) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>("confirm")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const confettiFrameRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  const { data: tableData } = useTableContext()
  const { items, clearCart, totalPrice, totalItems, estimateTime } = useCart()
  const { mutate, isPending } = useCreateTableOrder()

  const tableId = tableData?.table.id
  const organizationId = tableData?.organization.id
  const canSubmit =
    Boolean(tableId && organizationId && items.length) && !isPending

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (confettiFrameRef.current !== null) {
        cancelAnimationFrame(confettiFrameRef.current)
      }
      confetti.reset()
    }
  }, [])

  const stopConfetti = useCallback(() => {
    if (confettiFrameRef.current !== null) {
      cancelAnimationFrame(confettiFrameRef.current)
      confettiFrameRef.current = null
    }
    confetti.reset()
  }, [])

  const fireConfetti = useCallback(() => {
    const end = Date.now() + CONFETTI_DURATION_MS

    const frame = () => {
      if (Date.now() > end || !isMountedRef.current) {
        confettiFrameRef.current = null
        return
      }
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: CONFETTI_COLORS,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: CONFETTI_COLORS,
      })
      confettiFrameRef.current = requestAnimationFrame(frame)
    }

    frame()
  }, [])

  useEffect(() => {
    if (phase === "success") fireConfetti()
    if (phase !== "success") stopConfetti()
  }, [phase, fireConfetti, stopConfetti])

  function reset() {
    stopConfetti()
    if (phase === "success") clearCart()
    setPhase("confirm")
    setErrorMsg(null)
  }

  function placeOrder() {
    if (!canSubmit) return
    setPhase("placing")
    setErrorMsg(null)

    mutate(
      {
        tableId: tableId!,
        data: {
          organizationId: organizationId!,
          notes: orderNotes?.trim() || null,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            variant: i.variant,
            quantity: i.quantity,
            notes: i.notes,
          })),
        },
      },
      {
        onSuccess: () => {
          if (!isMountedRef.current) return
          setPhase("success")
        },
        onError: (err) => {
          if (!isMountedRef.current) return
          setPhase("error")
          setErrorMsg(
            err instanceof Error ? err.message : "Something went wrong"
          )
        },
      }
    )
  }

  const dismissible = phase !== "placing"

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => {
        if (!v && !dismissible) return
        setOpen(v)
        if (!v) reset()
      }}
    >
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent
        onPointerDownOutside={(e: unknown) => {
          if (!dismissible) (e as Event).preventDefault()
        }}
        onInteractOutside={(e: unknown) => {
          if (!dismissible) (e as Event).preventDefault()
        }}
        thumbClassName="mt-1"
      >
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {phase === "confirm" && "Review your order"}
            {phase === "placing" && "Placing your order..."}
            {phase === "success" && "Order placed successfully!"}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {phase === "confirm" &&
              "Your order will be sent to the kitchen once you place it."}
            {phase === "placing" && "Please wait while we process your order."}
            {phase === "error" &&
              "An error occurred while placing your order. Please try again."}
            {phase === "success" &&
              "Your order has been placed successfully. Thank you!"}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="relative flex flex-col gap-5">
            <div
              key={phase}
              className="flex w-full flex-col items-center gap-3 text-center animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {phase === "placing" && (
                <Image
                  src="/assets/loading.svg"
                  alt="Loading"
                  height={100}
                  className="size-50"
                  width={100}
                />
              )}

              {phase === "success" && <SuccessRippleAnimation />}

              {phase === "error" && errorMsg && (
                <p className="text-xs text-muted-foreground">{errorMsg}</p>
              )}
            </div>

            {phase === "confirm" && (
              <>
                <div className="w-full rounded-lg border bg-muted/30">
                  <div className="max-h-70 h-full divide-y overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={`${item.menuItemId}-${item.variant ?? "default"}`}
                        className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {item.quantity}× {item.name ?? item.menuItemId}
                          </span>
                          {item.variant && (
                            <span className="text-xs text-muted-foreground">
                              {item.variant}
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-xs italic text-muted-foreground">
                              “{item.notes}”
                            </span>
                          )}
                        </div>
                        {typeof item.price === "number" && (
                          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {orderNotes && (
                  <p className="text-sm text-muted-foreground italic">
                    Note: {orderNotes}
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-sm flex items-center justify-between">
                    Estimate Time{" "}
                    <span className="font-medium">{estimateTime}min</span>
                  </p>
                  <p className="text-sm flex items-center justify-between">
                    Total <span className="font-medium">₹{totalPrice}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          {phase === "confirm" && (
            <Button size="lg" onClick={placeOrder} disabled={!canSubmit}>
              Place Order
            </Button>
          )}

          {phase === "placing" && (
            <Button disabled className="min-w-32">
              Placing…
            </Button>
          )}

          {phase === "success" && (
            <Button
              className="min-w-32"
              onClick={() => {
                clearCart()
                setOpen(false)
              }}
            >
              Done
            </Button>
          )}

          {phase === "error" && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={placeOrder}
                disabled={isPending}
                className="min-w-24"
              >
                {isPending ? "Retrying…" : "Retry"}
              </Button>
            </div>
          )}
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
