"use client"

import { useState } from "react"
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
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { toast } from "sonner"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { Loader } from "@workspace/ui/components/loader"
import { IconTrash, IconPlus } from "@tabler/icons-react"
import api from "@/lib/axios"
import { useSession } from "@/modules/providers/session-provider"

interface MenuItem {
  id: string
  name: string
  price: { half: number; full: number }
  isAvailable: boolean
}

interface TableItem {
  id: string
  number: number
}

interface OrderItemForm {
  menuItemId: string
  name: string
  variant: "half" | "full"
  quantity: number
  unitPrice: number
}

export default function CreateManualOrderModal({
  children,
}: {
  children: React.ReactNode
}) {
  const { organization } = useSession()
  const qc = useQueryClient()

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const [tableNumber, setTableNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])

  const [selectedMenuItem, setSelectedMenuItem] = useState("")
  const [selectedVariant, setSelectedVariant] = useState<"half" | "full">("full")
  const [itemQuantity, setItemQuantity] = useState(1)

  const { data: tables = [] } = useQuery<TableItem[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const res = await api.get("/organization/table")
      return res.data.data || []
    },
    enabled: open && !!organization?.id,
  })

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu-items", organization?.id],
    queryFn: async () => {
      const res = await api.post("/organization/menu/all", {
        organizationId: organization?.id,
      })
      const items: MenuItem[] = (res.data.data || []).flatMap(
        (menu: { items: MenuItem[] }) => menu.items || []
      )
      return items.filter((i) => i.isAvailable)
    },
    enabled: open && !!organization?.id,
  })

  function reset() {
    setTableNumber("")
    setCustomerName("")
    setNotes("")
    setOrderItems([])
    setSelectedMenuItem("")
    setSelectedVariant("full")
    setItemQuantity(1)
  }

  function addItem() {
    if (!selectedMenuItem) {
      toast.error("Please select a menu item")
      return
    }
    const item = menuItems.find((m) => m.id === selectedMenuItem)
    if (!item) return

    const unitPrice =
      selectedVariant === "half" ? item.price.half : item.price.full

    setOrderItems([
      ...orderItems,
      {
        menuItemId: item.id,
        name: item.name,
        variant: selectedVariant,
        quantity: itemQuantity,
        unitPrice,
      },
    ])

    setSelectedMenuItem("")
    setSelectedVariant("full")
    setItemQuantity(1)
  }

  function removeItem(index: number) {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  async function handleCreate() {
    if (!organization?.id) {
      toast.error("Organization not found")
      return
    }
    if (!tableNumber) {
      toast.error("Please select a table")
      return
    }
    if (orderItems.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    setPending(true)

    try {
      const res = await api.post("/organization/orders", {
        organizationId: organization.id,
        tableNumber,
        customerName: customerName.trim() || null,
        notes: notes.trim() || null,
        items: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        subtotal,
        taxableAmount: subtotal,
        grandTotal: subtotal,
      })

      if (res.data?.status === "success") {
        setOpen(false)
        reset()
        toast.success("Order created!")
        qc.invalidateQueries({ queryKey: ["orders"] })
      } else {
        throw new Error(res.data?.message || "Failed to create order")
      }
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } }
        message?: string
      }
      const message =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.error ||
        axiosError?.message ||
        "Failed to create order"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create Manual Order</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Add items and details to create a new order.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalBody className="max-h-130 overflow-y-scroll no-scrollbar">
          <div className="px-1.5 space-y-4 ">
            <div className="space-y-2">
              <Label htmlFor="table">Table</Label>
              <NativeSelect className="w-full" value={tableNumber} onChange={(e)=>setTableNumber(e.target.value)}>
                <NativeSelectOption value="" disabled>
                  Select a table
                </NativeSelectOption>
                  {tables.map((t) => (
                    <NativeSelectOption key={t.id} value={String(t.number)}>
                      Table {t.number}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">
                Customer Name{" "}
                <span className="text-foreground/80 text-xs">Optional</span>
              </Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <Label>Order Items</Label>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="menuItem">
                    Menu Item
                  </Label>
                  <NativeSelect
                    value={selectedMenuItem}
                    className="w-full"
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                  >
                    <NativeSelectOption value="" disabled>
                      Select menu item
                    </NativeSelectOption>
                    {menuItems.map((item) => (
                      <NativeSelectOption key={item.id} value={item.id}>
                        {item.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Variant</Label>
                    <NativeSelect
                      value={selectedVariant}
                      onChange={(e) =>
                        setSelectedVariant(e.target.value as "half" | "full")
                      }
                    >
                      <NativeSelectOption value="half">Half</NativeSelectOption>
                      <NativeSelectOption value="full">Full</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      className="h-8"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={addItem}
                  disabled={!selectedMenuItem}
                >
                  <IconPlus /> Add Item
                </Button>
              </div>

              {orderItems.length > 0 && (
                <div className="space-y-1 border-t pt-2">
                  {orderItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="flex-1 truncate">
                        {item.name} ({item.variant}) x{item.quantity}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="shrink-0 text-destructive"
                      >
                        <IconTrash className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes{" "}
                <span className="text-foreground/80 text-xs">Optional</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-1 border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Grand Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setOpen(false)
              reset()
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={pending || !tableNumber || orderItems.length === 0}
            onClick={handleCreate}
          >
            Create Order
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
