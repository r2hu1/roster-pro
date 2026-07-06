import React from "react"
import NextImage from "next/image"
import { Button } from "@workspace/ui/components/button"
import { ShoppingCart } from "lucide-react"
import CartBut from "./CartBut"

export default function Header({
  data,
}: {
  data: { name: string; address: string; logoUrl: string }
}) {
  return (
    <div className="flex items-center justify-between ">
      <div className="flex items-center gap-1">
        <div>
          <NextImage src={data.logoUrl} width={60} height={60} alt="logo" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-font-heading  text-lg font-extrabold">
            {data.name}
          </h1>
          <p className="text-foreground/50 leading-4">
            {data.address.slice(0, 15)} ...
          </p>
        </div>
      </div>
      <div>
        <CartBut/>
      </div>
    </div>
  )
}
