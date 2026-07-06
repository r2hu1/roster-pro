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
import { useRouter } from "next/navigation"
import api from "@/lib/axios"

export default function DeleteMenu({
  menuId,
  orgId,
  children,
}: {
  menuId: string
  orgId: string | undefined
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const qc = useQueryClient()
  const router = useRouter();

  async function handleDelete() {
    setPending(true);

    try {
      const res = await api.delete(`/organization/menu/${menuId}`)

      if (res.status >= 200 && res.status < 300) {
        setOpen(false)
        toast.success("Menu deleted!")
        qc.invalidateQueries({ queryKey: ["menus"] })
        router.push(`/${orgId}/menus`)
      } else {
        throw new Error(res.data?.message || "Failed to delete menu")
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
        "Failed to delete menu"
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
          <ResponsiveModalTitle>Are you sure?</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Are you sure you want to delete this menu and all its items? This
            action cannot be undone.
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
