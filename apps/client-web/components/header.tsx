"use client"
import { useCart } from "@/modules/cart/views/provider/cart-provider"
import CartSheet from "@/modules/cart/views/ui/cart-sheet"
import { useTableContext } from "@/modules/providers/table-provider"
import { CartShopping } from "reicon-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"

export default function Header() {
  const { data } = useTableContext()
  const { totalItems } = useCart()
  return (
    <header className="pt-5 px-6 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Image
          className="size-14 rounded-xl"
          src={data?.organization.logo ?? "/assets/roster-pro-logo.jpeg"}
          alt="Logo"
          width={100}
          height={100}
        />
        <div className="truncate space-y-px">
          <h1 className="text-base w-auto font-medium">
            {data?.organization.name}
          </h1>
          <p className="text-xs">{data?.organization.phone}</p>
        </div>
      </div>
      <CartSheet>
        <Button size="icon-lg" className="relative">
          <CartShopping className="size-4" />
          <span className="sr-only">Cart</span>
          <Badge className="absolute -top-1 -right-1 text-[11px] p-0 h-4 w-4">
            {totalItems}
          </Badge>
        </Button>
      </CartSheet>
    </header>
  )
}
