"use client"

import * as React from "react"
import {
  Armchair2,
  BillList,
  Cart,
  ChartBarTrendUp,
  ChefHat,
  Search,
  Settings,
} from "reicon-react"

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
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { useSession } from "@/modules/providers/session-provider"
import { OrganizationResponse } from "@workspace/shared/schemas/organization/response"
import { Logo } from "@/components/logo"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { UniversalSearch } from "./universal-search"

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
      icon: Cart,
    },
    {
      title: "Tables",
      url: "/tables",
      icon: Armchair2,
    },
    {
      title: "Menus",
      url: "/menus",
      icon: ChefHat,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ChartBarTrendUp,
    },
    {
      title: "Receipts",
      url: "/receipts",
      icon: BillList,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { organization } = useSession()

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarRail />
      <SidebarHeader>
        <SidebarMenu className="space-y-4.5">
          <SidebarMenuItem className="flex items-center justify-between">
            <Logo className="h-9 -ml-1.5 w-auto" />
            <SidebarTrigger />
          </SidebarMenuItem>
          <SidebarMenuItem className="px-2 hidden">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 px-3 text-base h-10 bg-foreground text-background duration-200 ease-linear hover:bg-foreground/90 hover:text-background active:bg-primary/90 active:text-primary-foreground"
            >
              <BillList className="size-4" />
              <span>Create Order</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UniversalSearch>
              <InputGroup className="h-10 px-1 bg-background shadow-sm text-[14.5px] rounded-md">
                <InputGroupInput readOnly placeholder="Search anything..." />
                <InputGroupAddon align="inline-end">
                  <Search className="size-4" />
                </InputGroupAddon>
              </InputGroup>
            </UniversalSearch>
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
