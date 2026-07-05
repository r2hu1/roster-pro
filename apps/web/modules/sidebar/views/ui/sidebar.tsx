"use client"

import * as React from "react"
import {
  IconArmchair,
  IconChargingPile,
  IconChartArea,
  IconChartBar,
  IconChefHat,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReceipt2,
  IconReceiptRupee,
  IconReceiptRupeeFilled,
  IconSearch,
  IconSettings,
  IconStack,
  IconStackBack,
  IconStackMiddle,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
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
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { useSession } from "@/modules/providers/session-provider"
import { Organization } from "better-auth/client"
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
      url: "/orders",
      icon: IconStack,
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
      url: "#",
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
  const { organization } = useSession()

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarRail />
      <SidebarHeader>
        <SidebarMenu className="bg-background shadow-sm rounded-lg pb-2 pt-1 space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Logo className="h-13 w-auto" />
            </SidebarMenuButton>
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
          <SidebarMenuItem className="px-2">
            <InputGroup className="h-10 px-1 text-[14.5px] rounded-md">
              <InputGroupInput placeholder="Search anything..." />
              <InputGroupAddon align="inline-end">
                <IconSearch className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser org={organization as OrganizationResponse} />
      </SidebarFooter>
    </Sidebar>
  )
}
