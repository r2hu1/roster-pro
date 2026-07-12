"use client"

import { useState } from "react"
import Image from "next/image"
import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalBody,
} from "@workspace/ui/components/responsive-modal"
import { Button } from "@workspace/ui/components/button"
import {
  ButtonGroup,
} from "@workspace/ui/components/button-group"
import { Badge } from "@workspace/ui/components/badge"
import { IconMinus, IconPlus, IconShoppingCartPlus } from "@tabler/icons-react"

interface Props {
  item: MenuItemResponse
  children: React.ReactNode
  onAddToCart?: (item: MenuItemResponse, quantity: number) => void
}

export default function ResponsiveItemModal({
  item,
  children,
  onAddToCart,
}: Props) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  function reset() {
    setQuantity(1)
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

      <ResponsiveModalContent thumbClassName="mt-1">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{item.name}</ResponsiveModalTitle>
          {item.description && (
            <ResponsiveModalDescription>
              {item.description}
            </ResponsiveModalDescription>
          )}
        </ResponsiveModalHeader>

        <ResponsiveModalBody className="max-h-[80vh] overflow-y-scroll no-scrollbar">
          <div className="space-y-4">
            {item.image && (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center bg-secondary p-1 w-fit rounded-md pr-3 gap-2">
                <Badge
                  variant="secondary"
                  className="size-5 rounded-sm! p-0 flex items-center justify-center"
                >
                  <span
                    className={
                      "flex size-3 shrink-0 items-center justify-center rounded-[3px] border " +
                      (item.isVegetarian
                        ? "border-green-600"
                        : "border-red-600")
                    }
                  >
                    <span
                      className={
                        "size-1.5 rounded-full " +
                        (item.isVegetarian ? "bg-green-600" : "bg-red-600")
                      }
                    />
                  </span>
                </Badge>
                {item.preparationTime && (
                  <span className="text-sm text-muted-foreground">
                    {item.preparationTime} min
                  </span>
                )}
              </div>
              <div className="bg-primary/10 text-primary flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
                <span>
                  <span className="text-muted-foreground">Half</span> ₹
                  {item.price.half}
                </span>
                <span className="bg-primary/25 h-4 w-px" />
                <span>
                  <span className="text-muted-foreground">Full</span> ₹
                  {item.price.full}
                </span>
              </div>
            </div>

            {item.description && (
              <p className="text-sm capitalize">{item.description}</p>
            )}

            {item.ingredients && item.ingredients.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ingredients
                </p>
                <p className="text-sm capitalize">
                  {item.ingredients.join(", ")}
                </p>
              </div>
            )}
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <div className="flex w-full items-center gap-2">
            <ButtonGroup>
              <Button
                size="icon-lg"
                variant="secondary"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <IconMinus />
              </Button>
              <Button
                variant="secondary"
                className="disabled:opacity-100"
                disabled
                size="icon-lg"
              >
                {quantity}
              </Button>
              <Button
                size="icon-lg"
                variant="secondary"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <IconPlus />
              </Button>
            </ButtonGroup>

            <Button
              className="flex-1"
              size="icon-lg"
              onClick={() => {
                onAddToCart?.(item, quantity)
                setOpen(false)
                reset()
              }}
            >
              Add to Cart <IconShoppingCartPlus/>
            </Button>
          </div>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
