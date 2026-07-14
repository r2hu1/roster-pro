"use client"

import { useState } from "react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@workspace/ui/components/responsive-modal"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { IconPrinter } from "@tabler/icons-react"
import { toast } from "sonner"
import { useSession } from "@/modules/providers/session-provider"
import { generateInvoice, fetchSessionBill } from "@/modules/orders/api/orders"
import { printReceipt } from "@/modules/receipts/views/ui/print-receipt"
import { Badge } from "@workspace/ui/components/badge"

interface PrintReceiptVersionModalProps {
  orderId: string
  sessionId?: string | null
  children: React.ReactNode
}

export default function PrintReceiptVersionModal({
  orderId,
  sessionId,
  children,
}: PrintReceiptVersionModalProps) {
  const { organization } = useSession()
  const [open, setOpen] = useState(false)
  const [printing, setPrinting] = useState<"session" | "ticket" | null>(null)

  async function handlePrint(mode: "session" | "ticket") {
    if (!organization?.id) {
      toast.error("No organization session")
      return
    }

    setPrinting(mode)

    try {
      if (mode === "session" && sessionId) {
        const bill = await fetchSessionBill(sessionId)
        printReceipt(bill)
      } else {
        const invoice = await generateInvoice(orderId, organization.id)
        printReceipt(invoice)
      }
      setOpen(false)
    } catch (error) {
      console.error("Failed to print receipt:", error)
      const message =
        error instanceof Error ? error.message : "Failed to print receipt"
      toast.error(message)
    } finally {
      setPrinting(null)
    }
  }

  if (!sessionId) {
    return (
      <Button
        size="lg"
        variant="default"
        onClick={() => handlePrint("ticket")}
        disabled={printing !== null}
      >
        {printing === "ticket" ? <Loader /> : <IconPrinter />}
        Print
      </Button>
    )
  }

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent thumbClassName="mt-1">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Print Receipt</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            This order is part of a multi-round session. Choose how you want to
            print.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="grid gap-3 px-4 pb-2 md:px-0 pb-4">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-3! relative"
            disabled={printing !== null}
            onClick={() => handlePrint("session")}
          >
            <span className="text-sm font-semibold">Session Receipt</span>
            <span className="text-xs text-muted-foreground font-normal">
              Consolidated bill for all rounds at this table
            </span>
            <Badge className="absolute -top-2 -right-2">Recommended</Badge>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-3!"
            disabled={printing !== null}
            onClick={() => handlePrint("ticket")}
          >
            <span className="text-sm font-semibold">Ticket Receipt</span>
            <span className="text-xs text-muted-foreground font-normal">
              Single receipt for this order only
            </span>
          </Button>
        </div>

        {/*<ResponsiveModalFooter>
          <Button
            variant="secondary"
            disabled={printing !== null}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          {printing && (
            <Button disabled>
              {printing === "session" ? "Printing session..." : "Printing ticket..."}
              <Loader />
            </Button>
          )}
        </ResponsiveModalFooter>*/}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
