"use client"

import { useQueryState } from "nuqs"
import { Button } from "@workspace/ui/components/button"
import { Bulb, CreditCard, Home, ShoppingCart } from "reicon-react"

const navs = [
  { title: "General", href: "general", icon: Home },
  { title: "Billing", href: "billing", icon: ShoppingCart },
  { title: "Subscription", href: "subscription", icon: CreditCard },
  { title: "Support", href: "support", icon: Bulb },
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
          className="justify-start gap-3 h-10"
        >
          <nav.icon weight={tab === nav.href ? "Filled" : "Outline"} />{" "}
          {nav.title}
        </Button>
      ))}
    </div>
  )
}
