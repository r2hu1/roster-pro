"use client"

import { useQueryState } from "nuqs"
import {
  IconBulb,
  IconCreditCard,
  IconHome,
  IconSettings2,
  IconShoppingBagEdit,
} from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

const navs = [
  { title: "General", href: "general", icon: IconHome },
  { title: "Billing", href: "billing", icon: IconShoppingBagEdit },
  { title: "Subscription", href: "subscription", icon: IconCreditCard },
  { title: "Support", href: "support", icon: IconBulb },
]

export default function SettingsNavbar() {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "general",
  })

  return (
    <div className="flex md:flex-col overflow-x-scroll no-scrollbar gap-1 md:max-w-60 w-full">
      {navs.map((nav) => (
        <Button
          key={nav.href}
          onClick={() => setTab(nav.href)}
          variant={tab === nav.href ? "secondary" : "ghost"}
          size="lg"
          className="justify-start gap-2 h-10"
        >
          <nav.icon /> {nav.title}
        </Button>
      ))}
    </div>
  )
}
