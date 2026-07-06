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
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@workspace/ui/components/input-group"
import { IconCoinRupee } from "@tabler/icons-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Loader } from "@workspace/ui/components/loader"
import { DnDImageInput } from "@workspace/ui/components/dnd-image-input"
import api from "@/lib/axios"
import { CreateMenuItemSchema } from "@workspace/shared/schemas/menu/menu-item/create"

export default function CreateMenuItemModal({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [name, setName] = useState("")
  const [halfPrice, setHalfPrice] = useState("")
  const [fullPrice, setFullPrice] = useState("")
  const [ingredientsText, setIngredientsText] = useState("")
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const qc = useQueryClient()
  const params = useParams<{ menuId: string }>()

  function reset() {
    setName("")
    setHalfPrice("")
    setFullPrice("")
    setIngredientsText("")
    setIsVegetarian(false)
    setIsAvailable(true)
    setDescription("")
    setImage(null)
  }

  async function handleCreate() {
    if (!params.menuId) {
      toast.error("Menu ID is missing")
      return
    }

    const half = halfPrice ? parseFloat(halfPrice) : 0
    const full = fullPrice ? parseFloat(fullPrice) : 0
    const ingredients = ingredientsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const parsed = CreateMenuItemSchema.safeParse({
      menuId: params.menuId,
      name: name.trim(),
      description: description.trim() || null,
      ingredients: ingredients.length > 0 ? ingredients : null,
      price: { half, full },
      isAvailable,
      isVegetarian,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setPending(true)

    try {
      const formData = new FormData()
      formData.append("menuId", params.menuId)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      formData.append("ingredients", ingredientsText)
      formData.append("price_half", halfPrice)
      formData.append("price_full", fullPrice)
      formData.append("isAvailable", String(isAvailable))
      formData.append("isVegetarian", String(isVegetarian))
      if (image) formData.append("image", image)

      const res = await api.post("/organization/menu/item", formData)

      if (res.data?.status === "success") {
        setOpen(false)
        reset()
        toast.success("Dish added to your menu!")
        qc.invalidateQueries({ queryKey: ["menu-items", params.menuId] })
      } else {
        throw new Error(res.data?.message || "Failed to create menu item")
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
        "Failed to create menu item"
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
      <ResponsiveModalTrigger>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Drafting Menu Item</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Create a new menu item, you can add ingredients, price and more.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form
          className="no-scrollbar grid max-h-[60vh] gap-3 overflow-y-auto overflow-x-hidden px-4 md:px-1"
          onSubmit={(e) => {
            e.preventDefault()
            handleCreate()
          }}
        >
          <Label>Item Image</Label>
          <DnDImageInput previewClassName="size-30!" onChange={(file) => setImage(file)} />

          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="My Originals"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Label>Price</Label>
          <div className="grid grid-cols-2 gap-2">
            <InputGroup>
              <InputGroupInput
                type="number"
                step="any"
                min="0"
                placeholder="Half"
                value={halfPrice}
                onChange={(e) => setHalfPrice(e.target.value)}
                required
              />
              <InputGroupAddon>
                <IconCoinRupee className="size-3.5" />
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput
                type="number"
                step="any"
                min="0"
                placeholder="Full"
                value={fullPrice}
                onChange={(e) => setFullPrice(e.target.value)}
                required
              />
              <InputGroupAddon>
                <IconCoinRupee className="size-3.5" />
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A catchy and legit description..."
          />

          <Label htmlFor="ingredients">
            Ingredients{" "}
            <span className="text-foreground/80 text-xs">
              Separated by commas
            </span>
          </Label>
          <Textarea
            id="ingredients"
            placeholder="Tomatoes, Onions, Garlic..."
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            required
          />

          <div className="mt-2 flex items-center justify-between">
            <div className="grid gap-0.5">
              <Label>Is Vegetarian</Label>
              <p className="text-foreground/80 text-xs">
                Is this dish vegetarian?
              </p>
            </div>
            <Switch
              className="h-5 w-10"
              thumbClassName="h-4 w-4"
              checked={isVegetarian}
              onCheckedChange={setIsVegetarian}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="grid gap-0.5">
              <Label>Is Available</Label>
              <p className="text-foreground/80 text-xs">
                Is this dish available?
              </p>
            </div>
            <Switch
              className="h-5 w-10"
              thumbClassName="h-4 w-4"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
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
          <Button
            disabled={pending || !name.trim()}
            onClick={handleCreate}
          >
            Continue
            {pending && <Loader />}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
