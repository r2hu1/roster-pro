"use client"
import {
  type Icon,
} from "@tabler/icons-react"
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

export function NavMain({
  items,
  orgId,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  orgId: string | undefined
  }) {

  const path = usePathname();

  return (
    <SidebarGroup className={"p-2"}>
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu className="space-y-2 mt-4">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className={cn("h-11 text-[14.5px] px-3 bg-background shadow-sm",
                  path.includes(item.url) && "bg-linear-to-b from-primary to-chart-4 text-primary-foreground hover:opacity-85 hover:text-primary-foreground transition-all"
                )}
                tooltip={item.title}
                asChild
              >
                <Link href={orgId ? `/${orgId}${item.url}` : item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
