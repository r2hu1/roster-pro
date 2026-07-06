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
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import api from "@/lib/axios"

export default function DeleteItem({
  itemId,
  children,
}: {
  itemId: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const qc = useQueryClient()
  const params = useParams<{ menuId: string }>()

  async function handleDelete() {
    setPending(true)

    try {
      const res = await api.delete(`/organization/menu/item/${itemId}`)

      if (res.status >= 200 && res.status < 300) {
        setOpen(false)
        toast.success("Menu item deleted!")
        qc.invalidateQueries({ queryKey: ["menu-items", params.menuId] })
      } else {
        throw new Error(res.data?.message || "Failed to delete menu item")
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
        "Failed to delete menu item"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
      }}
    >
      <ResponsiveModalTrigger className="w-full">
        {children}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Are you sure?</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Are you sure you want to delete this dish/item from your restaurant?
            This action cannot be undone.
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
            disabled={pending}
            variant="destructive"
            onClick={handleDelete}
          >
            Continue
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
