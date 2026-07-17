"use client"
import { useSession } from "@/modules/providers/session-provider"
import SettingsNavbar from "./navbar"

export default function SettingPageView() {
  const { organization, isLoading } = useSession()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!organization) {
    return <div>Organization not found</div>
  }

  return (
    <div>
      <SettingsNavbar />
    </div>
  )
}
