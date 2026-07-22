"use client"

import { useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from "@workspace/ui/components/responsive-modal"
import { useTableContext } from "@/modules/providers/table-provider"
import { useCancelTableOrder } from "@/hooks/use-cancel-table-order"
import {
  useModifyTableOrder,
  type ModifyTableOrderItem,
} from "@/hooks/use-modify-table-order"
import { Trash2 } from "reicon-react"

type EditItem = {
  menuItemId: string
  name: string
  variant: "half" | "full"
  quantity: number
  unitPrice: number
  notes: string | null
}

export function OrderCustomerActions({ order }: { order: OrderResponse }) {
  if (order.status !== "pending") return null

  return (
    <div className="flex items-center gap-2 pt-1">
      <ModifyOrderModal order={order} />
      <CancelOrderModal order={order} />
    </div>
  )
}

function CancelOrderModal({ order }: { order: OrderResponse }) {
  const [open, setOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { data: session } = useTableContext()
  const { mutate, isPending } = useCancelTableOrder()

  function cancelOrder() {
    if (!session) return
    setErrorMsg(null)
    mutate(
      { orderId: order.id },
      {
        onSuccess: () => setOpen(false),
        onError: (err) =>
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to cancel order"
          ),
      }
    )
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => {
        if (isPending) return
        setOpen(v)
        if (!v) setErrorMsg(null)
      }}
    >
      <ResponsiveModalTrigger asChild>
        <Button size="sm" variant="destructive" className="flex-1">
          Cancel
        </Button>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent thumbClassName="mt-1">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Cancel this order?</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Order #{order.invoiceNumber} will be cancelled. This can&apos;t be
            undone.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          {errorMsg && (
            <p className="text-xs text-destructive text-center">{errorMsg}</p>
          )}
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Keep order
          </Button>
          <Button
            variant="destructive"
            onClick={cancelOrder}
            disabled={isPending}
            className="min-w-28"
          >
            {isPending ? "Cancelling…" : "Cancel order"}
            {isPending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

function ModifyOrderModal({ order }: { order: OrderResponse }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<EditItem[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { data: session } = useTableContext()
  const { mutate, isPending } = useModifyTableOrder()

  function seed() {
    setItems(
      order.items.map((it) => ({
        menuItemId: it.menuItemId,
        name: it.name,
        variant: it.variant,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        notes: it.notes ?? null,
      }))
    )
    setErrorMsg(null)
  }

  function setQty(index: number, delta: number) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
      )
    )
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
  const canSave = items.length > 0 && !isPending && Boolean(session)

  function save() {
    if (!canSave) return
    setErrorMsg(null)
    const payload: ModifyTableOrderItem[] = items.map((it) => ({
      menuItemId: it.menuItemId,
      variant: it.variant,
      quantity: it.quantity,
      notes: it.notes,
    }))
    mutate(
      { orderId: order.id, items: payload },
      {
        onSuccess: () => setOpen(false),
        onError: (err) =>
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to modify order"
          ),
      }
    )
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => {
        if (isPending) return
        if (v) seed()
        setOpen(v)
        if (!v) setErrorMsg(null)
      }}
    >
      <ResponsiveModalTrigger asChild>
        <Button size="sm" variant="secondary" className="flex-1">
          Modify
        </Button>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent thumbClassName="mt-1">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Modify order</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Adjust quantities or remove items. Prices update once you save.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody className="max-h-[55vh] overflow-y-auto no-scrollbar">
          <div className="rounded-lg border divide-y bg-muted/30">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No items left. Add at least one to keep the order, or cancel it
                instead.
              </p>
            )}
            {items.map((it, i) => (
              <div
                key={`${it.menuItemId}-${it.variant}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {it.name}
                    <span className="text-muted-foreground text-xs ml-1">
                      ({it.variant})
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ₹{it.unitPrice} each
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-md border">
                    <button
                      type="button"
                      onClick={() => setQty(i, -1)}
                      disabled={it.quantity <= 1}
                      className="size-7 grid place-content-center text-lg leading-none disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(i, 1)}
                      className="size-7 grid place-content-center text-lg leading-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => removeItem(i)}
                    variant="destructive"
                  >
                    <Trash2/>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 text-sm">
            <span className="text-muted-foreground">Items subtotal</span>
            <span className="font-medium tabular-nums">₹{total}</span>
          </div>
          {errorMsg && (
            <p className="pt-2 text-xs text-destructive text-center">
              {errorMsg}
            </p>
          )}
        </ResponsiveModalBody>
        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Discard
          </Button>
          <Button onClick={save} disabled={!canSave} className="min-w-28">
            {isPending ? "Saving…" : "Save changes"}
            {isPending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
