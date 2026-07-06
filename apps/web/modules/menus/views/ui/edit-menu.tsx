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
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { UpdateMenuSchema } from "@workspace/shared/schemas/menu/update"

export default function EditMenu({
  menuId,
  prevName,
  prevDesc,
  prevActive,
  children,
}: {
  menuId: string
  prevName: string
  prevDesc: string
  prevActive: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [name, setName] = useState(prevName)
  const [description, setDescription] = useState(prevDesc)
  const [isActive, setIsActive] = useState(prevActive)

  const qc = useQueryClient()

  function reset() {
    setName(prevName)
    setDescription(prevDesc)
    setIsActive(prevActive)
  }

  async function handleSave() {
    const parsed = UpdateMenuSchema.safeParse({
      id: menuId,
      name: name.trim(),
      description: description.trim() || null,
      isActive,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setPending(true)

    try {
      const res = await api.put("/organization/menu", parsed.data, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.data?.status === "success") {
        setOpen(false)
        toast.success("Menu updated!")
        qc.invalidateQueries({ queryKey: ["menus"] })
        qc.invalidateQueries({ queryKey: ["menu", menuId] })
      } else {
        throw new Error(res.data?.message || "Failed to update menu")
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
        "Failed to update menu"
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
        if (!v) reset()
      }}
    >
      <ResponsiveModalTrigger asChild className="w-full">
        {children}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit Menu</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Update your menu details.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form
          className="grid gap-3 px-4 md:px-0"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <Label htmlFor="menu-name">Name</Label>
          <Input
            id="menu-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Label htmlFor="menu-desc">Description</Label>
          <Textarea
            id="menu-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="grid gap-0.5">
              <Label>Active</Label>
              <p className="text-foreground/80 text-xs">Is this menu active?</p>
            </div>
            <Switch
              className="h-5 w-10"
              thumbClassName="h-4 w-4"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </form>

        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setOpen(false)
              reset()
            }}
          >
            Cancel
          </Button>
          <Button disabled={pending || !name.trim()} onClick={handleSave}>
            Save
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
