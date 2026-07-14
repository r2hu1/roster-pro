"use client"

import { useState } from "react"
import type { OrderStatus, PaymentStatus } from "@workspace/shared/enums"
import {
  NativeSelect,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { updateOrderStatus, updateOrder } from "../../api/orders"
import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"


export function OrderStatusSelect({
  orderId,
  initial,
}: {
  orderId: string
  initial: OrderStatus
}) {
  const [value, setValue] = useState(initial)

  return (
    <div className="grid gap-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        Order Status{" "}
        <span className="lowercase text-[10px]">(click to update)</span>
      </label>
      <div className="flex-wrap gap-2 items-center">
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
          <Button className="capitalize rounded-md!" variant={initial !== s ? "secondary" : "default"} onClick={() => updateOrderStatus(orderId, s, "")} key={s} value={s}>
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

  return (
    <div className="grid gap-1.5">
      <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        Payment Status{" "}
        <span className="lowercase text-[10px]">(click to update)</span>
      </label>
      <div className="flex-wrap gap-2 items-center">
        {(["pending", "paid", "failed", "refunded"] as PaymentStatus[]).map(
          (s) => (
            <Button disabled={s === initial} className="capitalize disabled:opacity-100 rounded-md!" variant={initial !== s ? "secondary" : "default"} onClick={() => updateOrder({ id: orderId, paymentStatus: s })} key={s} value={s}>
              {s}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
