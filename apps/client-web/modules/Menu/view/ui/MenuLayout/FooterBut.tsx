"use client"

import FormatPrice from "@/util/FormatPrice"
import { MenuItem } from "@workspace/shared"
import { DrawerClose } from "@workspace/ui/components/drawer"
import { Check, Minus, Plus, ShoppingCart } from "lucide-react"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CartItemType } from "@/modules/Cart/view/ui/ItemCard"
import Tost from "@/components/Tost"
import { sessionStoreKey } from "@/util/constant"

export default function FooterBut({ item }: { item: MenuItem }) {
  const [isHalf, setIsHalf] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  const router = useRouter()

  const unitPrice = isHalf ? item.price.half : item.price.full
  const totalPrice = unitPrice * quantity
  // console.log(item);

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  function handleAddToCart() {
    try {
      const cart = JSON.parse(sessionStorage.getItem(sessionStoreKey.cart) || "[]")

      if (cart.length > 0) {
        const existingItem = cart.find(
          (cartItem: any) => cartItem.id === item.id
        )
        if (existingItem) {
          // console.log("Item already exists in cart:", existingItem);
          existingItem.quantity += quantity
          existingItem.note = note.trim() || undefined
          sessionStorage.setItem(sessionStoreKey.cart, JSON.stringify(cart))
          window.dispatchEvent(new Event("cartUpdated")) // to auto update the cart item count
          Tost.success({
            heading: item.name,
            description: "Item updated in cart",
          })
          return
        }
      }
      cart.push({
        id: item.id,
        name: item.name,
        size: isHalf ? "half" : "full",
        unitPrice,
        quantity,
        image: item.image,
        category: item.category,
        isVegetarian: item.isVegetarian,
        preparationTime: item.preparationTime,
        note: note.trim() || undefined,
      })
      sessionStorage.setItem(sessionStoreKey.cart, JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated")) // to auto update the cart item count
      Tost.success({
        heading: item.name,
        description: "Added to your cart successfully",
      })
      // console.log("Item added to cart:", cart);
    } catch (error) {
      console.error("Failed to update cart", error)
    }
  }

  function handleOrderNow() {
    const foodItem: CartItemType = {
      id: item.id,
      name: item.name,
      size: isHalf ? "half" : "full",
      unitPrice,
      quantity,
      image: item.image,
      isVegetarian: item.isVegetarian,
      note: note.trim() || undefined,
    }

    router.push(`/cart?Item=${encodeURIComponent(JSON.stringify(foodItem))}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-medium text-foreground">
        Customize order
      </h2>

      {/* Size selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Size
          </span>
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => setIsHalf(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isHalf
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Half
            </button>
            <button
              type="button"
              onClick={() => setIsHalf(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !isHalf
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full
            </button>
          </div>
        </div>
        <span className="whitespace-nowrap text-xl font-semibold tabular-nums text-foreground">
          {FormatPrice(unitPrice)}
        </span>
      </div>

      {/* Quantity selector */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          Quantity
        </span>
        <div className="flex h-10 items-center gap-3 rounded-full border border-border bg-muted px-2">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-4 text-center text-sm font-semibold tabular-nums text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Note (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add extra sauce, extra cheese, etc..."
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <DrawerClose
          type="button"
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </DrawerClose>
        <button
          type="button"
          onClick={handleOrderNow}
          className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Order now · {FormatPrice(totalPrice)}
        </button>
      </div>
    </div>
  )
}
