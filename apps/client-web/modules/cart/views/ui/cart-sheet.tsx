"use client"

import Image from "next/image"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  IconClock,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react"
import type { CartItemVariant } from "../provider/cart-provider"
import { useCart } from "../provider/cart-provider"

interface Props {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CartSheet({ children, open, onOpenChange }: Props) {
  const {
    items,
    totalItems,
    totalPrice,
    estimateTime,
    removeFromCart,
    updateQuantity,
    changeVariant,
    clearCart,
  } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}

      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <IconShoppingBag className="size-12" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 max-h-140">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id}>
                    <div className="flex gap-3">
                      <div className="relative size-19 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="truncate text-sm font-medium w-auto">
                            {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </div>

                        <ButtonGroup className="bg-secondary rounded-md">
                          <Button
                            type="button"
                            variant={item.variant === "half" ? "default" : "ghost"}
                            size="xs"
                            onClick={() =>
                              changeVariant(item.id, "half" as CartItemVariant)
                            }
                          >
                            Half
                          </Button>
                          <Button
                            type="button"
                            variant={item.variant === "full" ? "default" : "ghost"}
                            size="xs"
                            onClick={() =>
                              changeVariant(item.id, "full" as CartItemVariant)
                            }
                          >
                            Full
                          </Button>
                        </ButtonGroup>

                        <div className="flex items-center justify-between gap-2">
                          <ButtonGroup>
                            <Button
                              size="icon-xs"
                              variant="secondary"
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <IconMinus className="size-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              disabled
                              className="disabled:opacity-100 min-w-8"
                              size="xs"
                            >
                              {item.quantity}
                            </Button>
                            <Button
                              size="icon-xs"
                              variant="secondary"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <IconPlus className="size-3" />
                            </Button>
                          </ButtonGroup>

                          <span className="text-sm font-medium tabular-nums">
                            ₹{item.unitPrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </ScrollArea>


            <SheetFooter>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimate time</span>
                <span className="flex items-center gap-1 font-medium">
                  <IconClock className="size-3.5" />
                  {estimateTime > 0 ? `${estimateTime} min` : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold tabular-nums">
                  ₹{totalPrice}
                </span>
              </div>
            </div>
              <Button className="w-full" size="lg">
                <IconShoppingBag className="size-4" />
                Confirm Order
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
