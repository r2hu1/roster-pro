"use client"

import { useEffect, useState } from "react"
import FormatPrice from "@/lib/format-price"
import Top from "./top"
import { CreateOrderDto } from "@workspace/shared"
import ItemCard, { CartItemType } from "./item-card"
import InvoiceDrawer from "./invoice-drawer"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"
import { MoveLeft, Soup } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CartPageView() {
  const { tableNumber }: Pick<CreateOrderDto, "tableNumber"> = {
    tableNumber: "1",
  }
  const [cartItem, setCartItem] = useState<CartItemType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const router = useRouter()

  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      const itemParam = searchParams.get("Item")

      if (itemParam) {
        const orderItem = JSON.parse(decodeURIComponent(itemParam))
        setCartItem([orderItem])
      } else {
        const cart = JSON.parse(sessionStorage.getItem("cart") || "[]")
        setCartItem(cart)
      }
    } catch (err) {
      console.error("Failed to parse cart item:", err)

      const cart = JSON.parse(sessionStorage.getItem("cart") || "[]")
      setCartItem(cart)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  function handleQuantityChange(id: string, delta: number) {
    setCartItem((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  function handleRemove(id: string) {
    setCartItem((prev) => {
      const item = prev.filter((item) => item.id !== id)
      sessionStorage.setItem("cart", JSON.stringify(item))
      return item
    })
  }

  function placeOrder() {
    console.log(cartItem)
  }

  const total = cartItem.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  if (loading) return <Loading />

  return (
    <div className="">
      <Top tableNumber={tableNumber} />
      {cartItem.length > 0 ? (
        <>
          <div className="mt-15 pt-20 px-2 max-h-[87vh] overflow-auto flex w-full flex-col gap-3">
            {cartItem.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">
                Total
              </span>
              <span className="text-xl font-bold text-foreground">
                {FormatPrice(total)}
              </span>
            </div>
          </div>
          <div className="fixed bg-white bottom-0 p-2 w-full flex items-center justify-center">
            <div className="w-full">
              <InvoiceDrawer
                cartItem={cartItem}
                tableNumber={tableNumber}
                onPlaceOrder={placeOrder}
              />
            </div>
          </div>
        </>
      ) : (
        <div className=" h-screen w-screen flex flex-col items-center justify-center gap-5  text-center">
          <img src="/empty-cart.jpeg" alt="" className="aspect-square w-2/3" />

          <p className="text-2xl font-black text-foreground">
            Your Cart is <span className="text-primary">Empty</span>
          </p>
          <button>
            <button
              onClick={() => router.push("/")}
              className=" bg-primary py-3 px-7 flex justify-center items-center text-lg font-bold text-white rounded-full"
            >
              <MoveLeft className="mr-2" />
              Start ordering
            </button>
          </button>
        </div>
      )}
    </div>
  )
}
