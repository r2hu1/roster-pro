"use client"

import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"

export default function KitchenModeToggle() {
  const { kitchenMode, setKitchenMode } = useKitchenMode()
  return (
    <Button
      variant="secondary"
      className="shadow-sm bg-background! fixed right-2 gap-3 bottom-2 z-10"
      size="lg"
    >
      Kitchen Mode
      <Switch checked={kitchenMode} onCheckedChange={setKitchenMode} />
    </Button>
  )
}
