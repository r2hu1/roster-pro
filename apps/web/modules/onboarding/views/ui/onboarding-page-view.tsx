"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Loader } from "@workspace/ui/components/loader"
import { DnDImageInput } from "@workspace/ui/components/dnd-image-input"
import { Logo } from "@/components/logo"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const PHONE_REGEX = /^\d{10}$/

export default function OnboardingPageView() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleImageChange = useCallback((file: File | null) => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setImage(file)
  }, [])

  function validate(
    name: string,
    phone: string,
    address: string
  ): string | null {
    if (!name || name.length < 2)
      return "Restaurant name must be at least 2 characters"
    if (name.length > 100)
      return "Restaurant name must be less than 100 characters"
    if (!phone) return "Restaurant phone is required"
    if (!PHONE_REGEX.test(phone))
      return "Please enter a valid 10-digit phone number"
    if (!address || address.length < 10)
      return "Please enter a full restaurant address"
    if (address.length > 500) return "Address must be less than 500 characters"
    if (image && !ALLOWED_IMAGE_TYPES.includes(image.type))
      return "Logo must be a JPEG, PNG, WebP, or GIF image"
    if (image && image.size > MAX_IMAGE_SIZE)
      return "Logo must be less than 5MB"
    return null
  }

  async function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const name = (formData.get("restaurantName") as string)?.trim() ?? ""
    const phone = (formData.get("restaurantPhone") as string)?.trim() ?? ""
    const address = (formData.get("restaurantAddress") as string)?.trim() ?? ""

    const error = validate(name, phone, address)
    if (error) {
      toast.error(error)
      setIsLoading(false)
      return
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const body = new FormData()
    if (image) body.append("logo", image)
    body.append("name", name)
    body.append("slug", slug)
    body.append("phone", `+91${phone}`)
    body.append("address", address)

    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        body,
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        throw new Error(errorBody?.message || `Request failed (${res.status})`)
      }

      toast.success("Restaurant created successfully!")
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex justify-between min-h-screen">
      <div className="grid gap-8 my-auto h-fit w-fit md:min-w-xl py-6 px-6 md:px-20 mx-auto">
        <div className="space-y-4">
          <Logo className="w-fit h-15 -ml-3" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Setup Your Restaurant</h1>
            <p className="text-muted-foreground text-sm">
              By clicking Continue, you agree to our{" "}
              <Link href="/terms" className="text-foreground underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <form className="grid gap-3" onSubmit={handleContinue}>
          <Label htmlFor="restaurant-image">Restaurant Logo</Label>

          <DnDImageInput
            onChange={handleImageChange}
            previewClassName="size-30"
          />
          <Label htmlFor="restaurant-name">Restaurant Name</Label>
          <Input
            id="restaurant-name"
            name="restaurantName"
            placeholder="My Restaurant"
            required
          />

          <Label className="mt-2" htmlFor="restaurant-phone">
            Restaurant Phone
          </Label>
          <InputGroup>
            <InputGroupAddon>+91</InputGroupAddon>

            <InputGroupInput
              id="restaurant-phone"
              name="restaurantPhone"
              placeholder="000-000-000"
              required
            />
          </InputGroup>

          <Label className="mt-2" htmlFor="restaurant-address">
            Restaurant Address
          </Label>
          <Textarea
            className="min-h-25"
            id="restaurant-address"
            name="restaurantAddress"
            placeholder="Central city, near New York tower, America 400928, USA..."
            required
          />

          <Button
            type="submit"
            className="mt-5 h-10"
            size="lg"
            disabled={isLoading}
          >
            Continue
            {isLoading && <Loader />}
          </Button>
        </form>
      </div>
      <div className="max-w-5xl w-full overflow-hidden">
        <Image
          alt="demo"
          src="/assets/people-thanking.jpeg"
          height={100}
          width={100}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  )
}
