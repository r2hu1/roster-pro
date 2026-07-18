"use client"
import { Button } from "@workspace/ui/components/button"
import { Logo } from "./roster-logo"
import { useTableContext } from "@/modules/providers/table-provider"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowUpRight, X, Copy } from "reicon-react"

export default function Footer() {
  const { data } = useTableContext()

  return (
    <footer className="py-6 mt-10 space-y-4 px-6 bg-secondary/40">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Image
            src={data?.organization.logo ?? "/assets/menu-item-placeholder.png"}
            height={100}
            width={100}
            alt="Logo"
            className="size-9 rounded-full"
          />
          <X className="size-4 text-muted-foreground!" />
          <Logo className="h-9 -ml-1" />
        </div>
        <p className="text-sm text-muted-foreground">
          {data?.organization.name} partners with us to help in building the
          next generation of restaurant.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            toast.promise(
              async () => {
                const text = process.env.NEXT_PUBLIC_MARKETING_URL!
                await navigator.clipboard.writeText(text)
              },
              {
                loading: "Copying...",
                success: "Link copied to clipboard!",
                error: "Failed to copy.",
              }
            )
          }}
          variant="outline"
          className="border-border!"
        >
          Share <Copy />
        </Button>
        <Button asChild>
          <Link
            href={
              process.env.NEXT_PUBLIC_MARKETING_URL! +
              `?utm_source=${data?.organization.name}`
            }
            target="_blank"
          >
            Learn More <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </footer>
  )
}
