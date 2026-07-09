"use client"

import { useState, useRef } from "react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalBody,
  ResponsiveModalFooter,
} from "@workspace/ui/components/responsive-modal"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import QR from "@/components/qr-code"
import type { QRHandle } from "@/components/qr-code"
import { IconDownload } from "@tabler/icons-react"
import { generateQrToken } from "../../api/tables"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function TableQrCodeModal({
  table,
  children,
}: {
  table: { id: string; number: number }
  children: React.ReactNode
}) {
  const qrRef = useRef<QRHandle>(null)
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) {
      setToken(null)
      return
    }
    setLoading(true)
    try {
      const result = await generateQrToken(table.id, table.number)
      setToken(result.token)
    } catch {
      toast.error("Failed to generate QR code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            QR Code - Table {table.number}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Scan to view the menu and place orders.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalBody className="flex justify-center">
          {loading ? (
            <Skeleton className="h-70 w-full" />
          ) : token ? (
            <QR ref={qrRef} token={token} />
          ) : null}
        </ResponsiveModalBody>
        {token && (
          <ResponsiveModalFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() =>
                qrRef.current?.download({
                  extension: "png",
                  name: `table-${table.number}-qr`,
                })
              }
            >
              <IconDownload /> Download
            </Button>
          </ResponsiveModalFooter>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
