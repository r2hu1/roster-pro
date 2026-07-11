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
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Loader } from "@workspace/ui/components/loader"
import api from "@/lib/axios"
import { CreateTableSchema } from "@workspace/shared/schemas/table/create"

export default function CreateTableModal({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [number, setNumber] = useState("")
  const [name, setName] = useState("")

  const qc = useQueryClient()

  function reset() {
    setNumber("")
    setName("")
  }

  async function handleCreate() {
    const parsed = CreateTableSchema.safeParse({
      number: Number(number),
      name: name.trim() || null,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setPending(true)

    try {
      const res = await api.post("/organization/table", parsed.data, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.data?.status === "success") {
        setOpen(false)
        reset()
        toast.success("Table added!")
        qc.invalidateQueries({ queryKey: ["tables"] })
      } else {
        throw new Error(res.data?.message || "Failed to create table")
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
        "Failed to create table"
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
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Add Table</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Add a new table to your restaurant.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form
          className="grid gap-3 px-4 md:px-0"
          onSubmit={(e) => {
            e.preventDefault()
            handleCreate()
          }}
        >
          <Label htmlFor="number">Table Number</Label>
          <Input
            id="number"
            type="number"
            min={1}
            placeholder="1"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />

          <Label htmlFor="name">
            Name <span className="text-foreground/80 text-xs">Optional*</span>
          </Label>
          <Input
            id="name"
            placeholder="Window Side"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <Button disabled={pending || !number.trim()} onClick={handleCreate}>
            Continue
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
