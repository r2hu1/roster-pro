"use client"

import { useEffect, useRef, useState } from "react"
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
import { IconDownload, IconRefresh } from "@tabler/icons-react"
import { generateQrToken, regenerateQrToken } from "../../api/tables"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQueryState } from "nuqs"

export default function TableQrCodeModal({
  table,
  children,
}: {
  table: { id: string; number: number }
  children: React.ReactNode
}) {
  const qrRef = useRef<QRHandle>(null)

  const [currentTable, setCurrentTable] = useQueryState("currentTable")

  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const open = currentTable === table.id

  async function regenerate() {
    if (
      !window.confirm(
        "Regenerate the QR code? The printed code on this table will stop working immediately and must be replaced. All active customer sessions on this table will be ended."
      )
    ) {
      return
    }
    setRegenerating(true)
    try {
      const result = await regenerateQrToken(table.id)
      setToken(result.token)
      toast.success("QR code regenerated — replace the printed code")
    } catch {
      toast.error("Failed to regenerate QR code")
    } finally {
      setRegenerating(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setToken(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadQr() {
      setLoading(true)

      try {
        const result = await generateQrToken(table.id, table.number)

        if (!cancelled) {
          setToken(result.token)
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to generate QR code")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadQr()

    return () => {
      cancelled = true
    }
  }, [open, table.id, table.number])

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(nextOpen) => {
        setCurrentTable(nextOpen ? table.id : null)
      }}
    >
      <ResponsiveModalTrigger asChild>
        {children}
      </ResponsiveModalTrigger>

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
              size="lg"
              className="w-full"
              onClick={() =>
                qrRef.current?.download({
                  extension: "png",
                  name: `table-${table.number}-qr`,
                })
              }
            >
              <IconDownload />
              Download
            </Button>
            <Button
              className="hidden!"
              size="lg"
              variant="outline"
              disabled={regenerating}
              onClick={regenerate}
            >
              <IconRefresh />
              {regenerating ? "Regenerating…" : "Regenerate QR"}
            </Button>
          </ResponsiveModalFooter>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
