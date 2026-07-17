"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useQueryState } from "nuqs"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar"
import {
  IconBulb,
  IconCreditCard,
  IconHome,
  IconLogout,
  IconSettings2,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import PageHeader from "@/components/page-header"
import { Button } from "@workspace/ui/components/button"
import { authClient } from "@/lib/better-auth/client"
import { toast } from "sonner"

const navs = [
  { title: "General", href: "general", icon: IconHome },
  { title: "Preferences", href: "preferences", icon: IconSettings2 },
  { title: "Billing", href: "billing", icon: IconCreditCard },
  { title: "Support", href: "support", icon: IconBulb },
]

export default function SettingsNavbar() {
  const { open } = useSidebar()
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

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "general",
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        actions={
          <Button onClick={handleLogout}>
            Logout <IconLogout />
          </Button>
        }
      />
      <ItemGroup className="gap-1 max-w-60 w-full">
        {navs.map((nav) => (
          <Button
            key={nav.href}
            onClick={() => setTab(nav.href)}
            variant={tab === nav.href ? "secondary" : "ghost"}
            size="lg"
            className="justify-start gap-3 h-10"
          >
            <nav.icon /> {nav.title}
          </Button>
        ))}
      </ItemGroup>
    </div>
  )
}
