"use client"

import { useSession } from "@/modules/providers/session-provider"
import { Button } from "@workspace/ui/components/button"
import { ForkKnife } from "reicon-react"
import { useRouter } from "next/navigation"

export default function KitchenModeToggle() {
  const { organization } = useSession()
  const router = useRouter()

  return (
    <Button
      variant="secondary"
      className="shadow-sm bg-background! fixed right-2 gap-3 bottom-2 z-10"
      size="lg"
      onClick={() => router.push(`/${organization?.id}/kitchen`)}
    >
      <ForkKnife className="size-4" />
      Kitchen Mode
    </Button>
  )
}
