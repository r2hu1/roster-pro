"use client"

import { useState } from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { Loader } from "@workspace/ui/components/loader"
import { DnDImageInput } from "@workspace/ui/components/dnd-image-input"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import api from "@/lib/axios"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { IconCoinRupee } from "@tabler/icons-react"
import { UpdateMenuItemSchema } from "@workspace/shared/schemas/menu/menu-item/update"

export default function EditMenuItem({
  open,
  onOpenChange,
  itemId,
  prevName,
  prevPrice,
  prevImage,
  prevAvailable,
  prevVegetarian,
  prevFeatured,
  prevIngredients,
  prevDescription,
  prevPreparationTime,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  prevName: string
  prevPrice: { half: number; full: number }
  prevImage?: string | null
  prevAvailable: boolean
  prevVegetarian: boolean
  prevFeatured: boolean
  prevIngredients: string[]
  prevDescription: string
  prevPreparationTime: number | null
}) {
  const [pending, setPending] = useState(false)
  const [name, setName] = useState(prevName)
  const [halfPrice, setHalfPrice] = useState(String(prevPrice.half))
  const [fullPrice, setFullPrice] = useState(String(prevPrice.full))
  const [ingredientsText, setIngredientsText] = useState(
    prevIngredients.join(", ")
  )
  const [isAvailable, setIsAvailable] = useState(prevAvailable)
  const [isVegetarian, setIsVegetarian] = useState(prevVegetarian)
  const [isFeatured, setIsFeatured] = useState(prevFeatured)
  const [description, setDescription] = useState(prevDescription)
  const [preparationTime, setPreparationTime] = useState(
    prevPreparationTime?.toString() ?? 20
  )
  const [image, setImage] = useState<File | null>(null)

  const qc = useQueryClient()
  const params = useParams<{ menuId: string }>()

  function reset() {
    setName(prevName)
    setHalfPrice(String(prevPrice.half))
    setFullPrice(String(prevPrice.full))
    setIngredientsText(prevIngredients.join(", "))
    setIsAvailable(prevAvailable)
    setIsVegetarian(prevVegetarian)
    setIsFeatured(prevFeatured)
    setPreparationTime(prevPreparationTime ?? 20)
    setDescription(prevDescription)
    setImage(null)
  }

  async function handleEdit() {
    const ingredients = ingredientsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const parsed = UpdateMenuItemSchema.safeParse({
      id: itemId,
      name: name.trim(),
      description: description.trim() || null,
      ingredients: ingredients.length > 0 ? ingredients : null,
      price: {
        half: parseFloat(halfPrice) || 0,
        full: parseFloat(fullPrice) || 0,
      },
      isAvailable,
      isVegetarian,
      isFeatured,
      preparationTime: Number(preparationTime) || 20,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setPending(true)

    try {
      const formData = new FormData()
      formData.append("id", itemId)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      formData.append("ingredients", ingredientsText)
      formData.append("price_half", halfPrice)
      formData.append("price_full", fullPrice)
      formData.append("isAvailable", String(isAvailable))
      formData.append("isVegetarian", String(isVegetarian))
      formData.append("isFeatured", String(isFeatured))
      formData.append("preparationTime", String(preparationTime))
      if (image) formData.append("image", image)

      const res = await api.put("/organization/menu/item", formData)

      if (res.data?.status === "success") {
        onOpenChange(false)
        toast.success("Menu item updated!")
        qc.invalidateQueries({ queryKey: ["menu-items", params.menuId] })
      } else {
        throw new Error(res.data?.message || "Failed to update menu item")
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
        "Failed to update menu item"
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editing {prevName}</SheetTitle>
          <SheetDescription>
            Click save to update the menu item.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-3 overflow-y-auto px-6 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleEdit()
          }}
        >
          <Label>Item Image</Label>
          <DnDImageInput
            onChange={(file) => setImage(file)}
            defaultPreview={prevImage}
            previewClassName="size-30!"
          />

          <div className="grid w-full gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              placeholder="Name of the item..."
              id="name"
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
          </div>

          <Label htmlFor="name">
            Preparation Time{" "}
            <span className="text-xs text-foreground/80">minutes</span>
          </Label>
          <Input
            id="preparationTime"
            type="number"
            step="any"
            min="0"
            placeholder="30"
            value={preparationTime}
            onChange={(e) => setPreparationTime(e.target.value)}
            required
          />

          <Label htmlFor="description">Description</Label>
          <Textarea
            placeholder="Description about the item..."
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Label htmlFor="ingredients">
            Ingredients{" "}
            <span className="text-foreground/80 text-xs">
              Separated by commas
            </span>
          </Label>
          <Textarea
            id="ingredients"
            placeholder="Onions, Garlic, ..."
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            required
          />

          <div className="mt-2 flex items-center justify-between">
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

          <div className="mt-2 flex items-center justify-between">
            <div className="grid gap-0.5">
              <Label>Featured</Label>
              <p className="text-foreground/80 text-xs">
                Mark this dish as featured
              </p>
            </div>
            <Switch
              className="h-5 w-10"
              thumbClassName="h-4 w-4"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>

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
        </form>
        <SheetFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              onOpenChange(false)
              reset()
            }}
          >
            Cancel
          </Button>
          <Button type="button" disabled={pending} onClick={handleEdit}>
            Save
            {pending && <Loader />}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
