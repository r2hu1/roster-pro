"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { IconPrinter } from "@tabler/icons-react"
import { useSession } from "@/modules/providers/session-provider"
import { generateInvoice } from "@/modules/orders/api/orders"
import { printReceipt } from "./print-receipt"
import type { InvoiceData } from "@workspace/shared/schemas/order/index"
import { Loader } from "@workspace/ui/components/loader"

interface PrintReceiptButtonProps {
  orderId: string
  size?: "default" | "sm" | "lg" | "icon"
  label?: string
  loadingLabel?: string
  variant?: any
  className?: any
}

export function PrintReceiptButton({
  orderId,
  size = "sm",
  label = "Print",
  loadingLabel = "Printing...",
  variant,
  className,
}: PrintReceiptButtonProps) {
  const { organization } = useSession()
  const [printing, setPrinting] = useState(false)

  const handlePrint = async () => {
    if (!organization?.id) return

    setPrinting(true)

    try {
      const invoice = (await generateInvoice(
        orderId,
        organization.id
      )) as InvoiceData

      printReceipt(invoice)
    } catch (error) {
      console.error("Failed to print receipt:", error)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handlePrint}
      className={className}
      disabled={!organization?.id || printing}
    >
      {printing ? <Loader /> : <IconPrinter />}
      Print
    </Button>
  )
}
