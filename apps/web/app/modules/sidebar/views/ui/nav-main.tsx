"use client"

import { IconCirclePlusFilled, IconMail, IconReceiptRupee, IconSearch, type Icon } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  }) {
  const { open } = useSidebar();
  return (
    <SidebarGroup className={cn(open && "p-4")}>
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu className="hidden">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 px-3 text-base h-10 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <IconReceiptRupee className="size-4"/>
              <span>New Order</span>
            </SidebarMenuButton>
        </SidebarMenu>
        <SidebarMenu>
          {open ? (
            <InputGroup className="bg-background! border-border">
              <InputGroupInput placeholder="Search anything..." />
              <InputGroupAddon align="inline-end">
                <IconSearch className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          ):<Button variant="outline" size="icon-lg"><IconSearch/></Button>}
        </SidebarMenu>
        <SidebarMenu className="space-y-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className="h-10 px-3 border bg-background" tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
