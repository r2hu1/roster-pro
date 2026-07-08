"use client"

import { useState } from "react"
import type { OrderStatus, PaymentStatus } from "@workspace/shared/enums"
import {
  NativeSelect,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { updateOrderStatus, updateOrder } from "../../api/orders"

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
        Order Status
      </label>
      <NativeSelect
        className="w-full"
        value={value}
        onChange={async (e) => {
          const v = e.target.value as OrderStatus
          setValue(v)
          await updateOrderStatus(orderId, v, "")
        }}
      >
        {(
          ["pending", "preparing", "ready", "served", "completed", "cancelled"] as OrderStatus[]
        ).map((s) => (
          <NativeSelectOption key={s} value={s}>
            {s}
          </NativeSelectOption>
        ))}
      </NativeSelect>
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
        Payment Status
      </label>
      <NativeSelect
        className="w-full"
        value={value}
        onChange={async (e) => {
          const v = e.target.value as PaymentStatus
          setValue(v)
          await updateOrder({ id: orderId, paymentStatus: v })
        }}
      >
        {(["pending", "paid", "failed", "refunded"] as PaymentStatus[]).map((s) => (
          <NativeSelectOption key={s} value={s}>
            {s}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
