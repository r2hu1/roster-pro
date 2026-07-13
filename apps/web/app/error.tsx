"use client"

import { useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { IconAlertTriangle, IconArrowUpRight} from "@tabler/icons-react"
import Link from "next/link"

export default function Error() {
  const reset = () => {
    window.location.reload()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      reset()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen px-6 flex-col items-center justify-center">
      <div className="space-y-px text-center">
        <IconAlertTriangle className="mx-auto size-7 mb-2" />
        <h1 className="text-xl font-medium">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred.
        </p>
      <div className="flex gap-2 mt-4 items-center justify-center">
        <Button asChild variant="secondary">
          <Link href="mailto:rahul@rosterpro.in">
          Report <IconArrowUpRight/>
          </Link>
        </Button>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
      </div>
    </div>
  )
}
