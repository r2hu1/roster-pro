"use client"

import { useState } from "react"
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

export default function OnboardingPageView() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [value] = useState("+1")
  const [isLoading, setIsLoading] = useState(false)

  async function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const name = formData.get("restaurantName") as string
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const phone = formData.get("restaurantPhone") as string
    const address = formData.get("restaurantAddress") as string

    const body = new FormData()
    body.append("logo", image!)
    body.append("name", name)
    body.append("slug", slug)
    if (phone) body.append("phone", `+91${phone}`)
    if (address) body.append("address", address)

    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        body,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create organization")
      }

      router.push("/")
    } catch (err) {
      console.error(err)
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
            onChange={(file) => {
              setImage(file)
              if (file) {
                setImagePreview(URL.createObjectURL(file))
              } else {
                setImagePreview(null)
              }
            }}
            previewClassName="size-30"
          />
          <Label htmlFor="restaurant-name">Restaurant Name</Label>
          <Input
            id="restaurant-name"
            name="restaurantName"
            placeholder="My Restaurant"
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
