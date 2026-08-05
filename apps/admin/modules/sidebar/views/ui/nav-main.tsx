"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconComponent } from "reicon-react"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: IconComponent
  }[]
  orgId?: string
}

export function NavMain({ items, orgId }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="p-2">
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu className="mt-4 space-y-2">
          {items.map((item) => {
            const href = orgId ? `/${orgId}${item.url}` : item.url

            const isActive =
              item.url === "/"
                ? pathname === `/${orgId}` || pathname === `/${orgId}/`
                : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "h-11 bg-background px-3 text-[14.5px] shadow-sm transition-all",
                    isActive &&
                      "bg-linear-to-b from-primary to-chart-4 text-primary-foreground hover:opacity-85 hover:text-primary-foreground"
                  )}
                >
                  <Link href={href}>
                    {item.icon && (
                      <item.icon weight={isActive ? "Filled" : "Outline"} />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
