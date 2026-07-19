"use client"

import { useState } from "react"
import type { OrderStatus, PaymentStatus } from "@workspace/shared/enums"
import { updateOrderStatus, updateOrder } from "../../api/orders"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"

export function OrderStatusSelect({
  orderId,
  initial,
}: {
  orderId: string
  initial: OrderStatus
}) {
  const [value, setValue] = useState(initial)
  const [pending, setPending] = useState<OrderStatus | null>(null)

  async function handleUpdate(s: OrderStatus) {
    if (s === value || pending) return
    const previous = value
    setValue(s)
    setPending(s)
    try {
      await updateOrderStatus(orderId, s, "")
    } catch {
      setValue(previous)
      toast.error("Failed to update order status")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        Order Status{" "}
        <span className="lowercase text-[10px]">(click to update)</span>
      </label>
      <div className="flex-wrap flex gap-1 items-center">
        {(
          [
            "pending",
            "preparing",
            "ready",
            "served",
            "completed",
            "cancelled",
          ] as OrderStatus[]
        ).map((s) => (
          <Button
            className="capitalize rounded-md! disabled:opacity-100! disabled:cursor-not-allowed! disabled:pointer-events-auto!"
            variant={value !== s ? "secondary" : "default"}
            disabled={pending !== null || s === value || (value === "cancelled" || value === "completed")}
            onClick={() => handleUpdate(s)}
            key={s}
            value={s}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function PaymentStatusSelect({
  orderId,
  initial,
}: {
  orderId: string
  initial: PaymentStatus
}) {
  const [value, setValue] = useState(initial)
  const [pending, setPending] = useState<PaymentStatus | null>(null)

  async function handleUpdate(s: PaymentStatus) {
    if (s === value || pending) return
    const previous = value
    setValue(s)
    setPending(s)
    try {
      await updateOrder({ id: orderId, paymentStatus: s })
    } catch {
      setValue(previous)
      toast.error("Failed to update payment status")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        Payment Status{" "}
        <span className="lowercase text-[10px]">(click to update)</span>
      </label>
      <div className="flex-wrap gap-1 flex items-center">
        {(["pending", "paid", "refunded"] as PaymentStatus[]).map(
          (s) => (
            <Button
              className="capitalize rounded-md! disabled:opacity-100! disabled:cursor-not-allowed! disabled:pointer-events-auto!"
              disabled={s === value || pending !== null}
              variant={value !== s ? "secondary" : "default"}
              onClick={() => handleUpdate(s)}
              key={s}
              value={s}
            >
              {s}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

export function PaymentMethodSelect({
  orderId,
  initial,
}: {
  orderId: string
  initial: string | null
}) {
  const [value, setValue] = useState(initial)
  const [pending, setPending] = useState<string | null>(null)

  async function handleUpdate(m: string) {
    if (m === value || pending) return
    const previous = value
    setValue(m)
    setPending(m)
    try {
      await updateOrder({ id: orderId, paymentMethod: m })
    } catch {
      setValue(previous)
      toast.error("Failed to update payment method")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="grid gap-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        Payment Method{" "}
        <span className="lowercase text-[10px]">(click to update)</span>
      </label>
      <div className="flex-wrap gap-4 flex items-center">
        {(["cash", "online"] as const).map((m) => (
          <label
            className="flex items-center gap-2 text-sm capitalize cursor-pointer"
            key={m}
          >
            <Checkbox
              checked={value === m}
              disabled={pending !== null}
              onCheckedChange={(checked) => {
                if (checked) handleUpdate(m)
              }}
            />
            {m}
          </label>
        ))}
      </div>
    </div>
  )
}
