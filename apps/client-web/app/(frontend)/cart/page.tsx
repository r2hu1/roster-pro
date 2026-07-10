import CartPageView from "@/modules/cart/views/ui/cart-page-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "Your cart, manage your items, and checkout.",
}

export default function Page() {
  return <CartPageView />
}
