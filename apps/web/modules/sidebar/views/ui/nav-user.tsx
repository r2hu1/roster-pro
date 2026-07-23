"use client"

import { authClient } from "@/lib/better-auth/client"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"
import { OrganizationResponse } from "@workspace/shared/schemas/organization/response"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { ForkKnife } from "reicon-react"
import { useRouter } from "next/navigation"
import { CreditCard, Logout2Newicons, Settings, UserCircle } from "reicon-react"
import { toast } from "sonner"

export function NavUser({ org }: { org: OrganizationResponse }) {
  const { isMobile } = useSidebar()

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

  const router = useRouter()

  return (
    <SidebarMenu className="space-y-3">
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          className="flex shadow-sm border-none hover:shadow-sm items-center h-9 text-sm! justify-between"
          onClick={() => router.push(`/${org.id}/kitchen`)}
        >
          <span className="flex items-center gap-2">
            <ForkKnife className="size-4" />
            Kitchen Mode
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-background shadow-sm text-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={org?.logo ?? ""} alt={org?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 truncate text-left text-sm leading-tight">
                <span className="truncate font-medium">{org?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {org?.address}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-2 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={org?.logo ?? ""} alt={org?.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 truncate text-left text-sm leading-tight">
                  <span className="truncate font-medium">{org?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {org?.address}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => router.push(`/${org.id}/settings?tab=general`)}
              >
                <UserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push(`/${org.id}/settings?tab=billing`)}
              >
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push(`/${org.id}/settings?tab=general`)}
              >
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <Logout2Newicons />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
