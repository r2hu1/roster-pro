"use client"

import { useState } from "react"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@workspace/ui/components/responsive-modal"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

export default function DeleteTableModal({
  tableId,
  tableNumber,
  children,
}: {
  tableId: string
  tableNumber: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const qc = useQueryClient()

  async function handleDelete() {
    setPending(true)

    try {
      const res = await api.delete(`/organization/table/${tableId}`)

      if (res.status >= 200 && res.status < 300) {
        setOpen(false)
        toast.success("Table deleted!")
        qc.invalidateQueries({ queryKey: ["tables"] })
      } else {
        throw new Error(res.data?.message || "Failed to delete table")
      }
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } }
        message?: string
      }
      const message =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.error ||
        axiosError?.message ||
        "Failed to delete table"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={(v) => setOpen(v)}>
      <span
        className="contents cursor-pointer"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true)
        }}
      >
        {children}
      </span>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            Delete Table {tableNumber}?
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Are you sure you want to delete this table? This action cannot be
            undone.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
          >
            Delete
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
