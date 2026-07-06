"use client"

import * as React from "react"
import {
  IconArmchair,
  IconChartArea,
  IconChefHat,
  IconHelp,
  IconReceiptRupee,
  IconSearch,
  IconSettings,
  IconStack,
  IconTruckDelivery,
} from "@tabler/icons-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useSession } from "@/modules/providers/session-provider"
import { OrganizationResponse } from "@workspace/shared/schemas/organization/response"
import { Logo } from "@/components/logo"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

const data = {
  user: {
    name: "r2hu1",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Orders",
      url: "/",
      icon: IconTruckDelivery,
    },
    {
      title: "Tables",
      url: "/tables",
      icon: IconArmchair,
    },
    {
      title: "Menus",
      url: "/menus",
      icon: IconChefHat,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartArea,
    },
    {
      title: "Receipts",
      url: "/receipts",
      icon: IconReceiptRupee,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { organization } = useSession();

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarRail />
      <SidebarHeader>
        <SidebarMenu className="space-y-4">
          <SidebarMenuItem className="-ml-2">
              <Logo className="h-10 w-auto" />
          </SidebarMenuItem>
          <SidebarMenuItem className="px-2 hidden">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 px-3 text-base h-10 bg-foreground text-background duration-200 ease-linear hover:bg-foreground/90 hover:text-background active:bg-primary/90 active:text-primary-foreground"
            >
              <IconReceiptRupee className="size-4" />
              <span>Create Order</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <InputGroup className="h-10 px-1 bg-background shadow-sm text-[14.5px] rounded-md">
              <InputGroupInput placeholder="Search anything..." />
              <InputGroupAddon align="inline-end">
                <IconSearch className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} orgId={organization?.id} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser org={organization as OrganizationResponse} />
      </SidebarFooter>
    </Sidebar>
  )
}
