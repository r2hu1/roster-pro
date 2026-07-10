import { ArrowLeft } from "lucide-react"
import React from "react"
import NextImage from "next/image"
import type { CreateOrderDto } from "@workspace/shared/schemas/order/create"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"

export default function Top({
  tableNumber,
}: Pick<CreateOrderDto, "tableNumber">) {
  const router = useRouter()
  return (
    <div className="fixed p-2 bg-white z-40  w-full top-0 flex justify-between items-center">
      <button type="button" onClick={() => router.back()} className="ml-5">
        <ArrowLeft size={22} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex flex-col justify-center text-right">
          <h1 className="text-font-heading  text-lg font-extrabold ">
            Table {tableNumber}
          </h1>
          <p className="text-foreground/50 leading-4">
            Review. Confirm. Enjoy.
          </p>
        </div>
        <NextImage src="/logo.jpeg" width={60} height={60} alt="logo" />
      </div>
    </div>
  )
}
