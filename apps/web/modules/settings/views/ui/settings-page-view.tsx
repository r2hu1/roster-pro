"use client"
import { useSession } from "@/modules/providers/session-provider"
import SettingsNavbar from "./navbar"
import { useQueryState } from "nuqs"
import GeneralSettings from "./general-settings"
import { Button } from "@workspace/ui/components/button"
import { IconLogout } from "@tabler/icons-react"
import PageHeader from "@/components/page-header"
import { authClient } from "@/lib/better-auth/client"
import { toast } from "sonner"

export default function SettingPageView() {
  const { organization, isLoading } = useSession()
  const [tab] = useQueryState("tab", { defaultValue: "general" })

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      window.location.href = "/"
    } catch (error) {
      toast.error("Failed to logout", {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!organization) {
    return <div>Organization not found</div>
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        actions={
          <Button onClick={handleLogout}>
            Logout <IconLogout />
          </Button>
        }
      />
      <div className="flex gap-20">
        <SettingsNavbar />
        <div className="flex-1 min-w-0">
          {tab === "general" && <GeneralSettings />}
          {tab === "preferences" && (
            <p className="text-muted-foreground text-sm">Coming soon</p>
          )}
          {tab === "billing" && (
            <p className="text-muted-foreground text-sm">Coming soon</p>
          )}
          {tab === "support" && (
            <p className="text-muted-foreground text-sm">Coming soon</p>
          )}
        </div>
      </div>
    </div>
  )
}
