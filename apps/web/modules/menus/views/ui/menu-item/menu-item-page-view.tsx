"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import {
  IconArrowLeft,
  IconCirclePlus,
  IconDotsVertical,
  IconPencil,
  IconSearch,
  IconToolsKitchen2Off,
  IconTrash,
} from "@tabler/icons-react"
import api from "@/lib/axios"
import PageHeader from "@/components/page-header"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import EmptyData from "@/components/empty"
import { useSession } from "@/modules/providers/session-provider"
import type { MenuResponse } from "@workspace/shared/schemas/menu/response"
import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import ItemCard from "./menu-item-card"
import CreateMenuItemModal from "./create-menu-item-responsive-modal"
import EditMenu from "../edit-menu"
import DeleteMenu from "../delete-menu"

export default function MenuItemsPageView() {
  const params = useParams<{ menuId: string }>()
  const [searchTerm, setSearchTerm] = useState("")
  const { organization: org } = useSession()

  const menuQuery = useQuery({
    queryKey: ["menu", params.menuId],
    queryFn: async () => {
      const res = await api.get(`/organization/menu/${params.menuId}`)
      return res.data.data as MenuResponse
    },
  })

  const itemsQuery = useQuery({
    queryKey: ["menu-items", params.menuId],
    queryFn: async () => {
      const res = await api.get(`/organization/menu/item/${params.menuId}`)
      return res.data.data as MenuItemResponse[]
    },
  })

  return (
    <section className="space-y-3">
      <PageHeader
        title={
          menuQuery.data?.name ? `Menu / ${menuQuery.data.name}` : "Menu Item"
        }
        icon={
          <Badge variant="default">
            {menuQuery.data?.isActive ? "Active" : "Inactive"}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <CreateMenuItemModal>
              <Button variant="secondary">
                New Item <IconCirclePlus className="size-3.5" />
              </Button>
            </CreateMenuItemModal>

            {menuQuery.isPending ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon">
                    <IconDotsVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-foreground/70 px-1 py-1 text-xs font-normal">
                      Actions
                    </DropdownMenuLabel>

                    <EditMenu
                      menuId={params.menuId}
                      prevName={menuQuery.data?.name ?? ""}
                      prevDesc={menuQuery.data?.description ?? ""}
                      prevActive={menuQuery.data?.isActive ?? false}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                        <IconPencil className="ml-auto size-3.5" />
                      </DropdownMenuItem>
                    </EditMenu>

                    <DeleteMenu orgId={org?.id} menuId={params.menuId}>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete
                        <IconTrash className="ml-auto size-3.5" />
                      </DropdownMenuItem>
                    </DeleteMenu>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <main className="grid gap-4">
        <InputGroup className="h-10">
          <InputGroupButton className="size-9.5!">
            <Link href={`/${org?.id}/menus/`}>
              <IconArrowLeft />
            </Link>
          </InputGroupButton>
          <InputGroupInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search menu items.."
          />
          <InputGroupButton variant="ghost">
            Search
            <IconSearch />
          </InputGroupButton>
        </InputGroup>

        <div className="grid gap-4">
          {itemsQuery.isPending ? (
            <Skeleton className="h-[400px] w-full" />
          ) : !itemsQuery.data?.length ? (
            <EmptyData
              icon={<IconToolsKitchen2Off />}
              title="No items in this menu yet."
              description="Start by creating a new item, click the button below."
              action={
                <CreateMenuItemModal>
                  <Button>
                    <IconCirclePlus />
                    <span>Create Item</span>
                  </Button>
                </CreateMenuItemModal>
              }
            />
          ) : (
            itemsQuery.data
              .filter((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .length > 0 ? (
              itemsQuery.data
                .filter((item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item) => <ItemCard key={item.id} item={item} />)
            ) : (
              <EmptyData
                icon={<IconToolsKitchen2Off />}
                title={`No items found for "${searchTerm}"`}
                description={`Want to create "${searchTerm}"? Click the button below to add it to your menu.`}
                action={
                  <CreateMenuItemModal>
                    <Button>
                      <IconCirclePlus />
                      <span>Create Item</span>
                    </Button>
                  </CreateMenuItemModal>
                }
              />
            )
          )}
        </div>
      </main>
    </section>
  )
}
