"use client"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"
import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import {
  IconCoinRupee,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import EditMenuItem from "./edit-menu-item"
import DeleteItem from "./delete-menu-item"
import MenuItemInfo from "./menu-item-info"

export default function ItemCard({ item }: { item: MenuItemResponse }) {
  return (
    <div className="bg-card flex items-center justify-between rounded-md border p-2 pr-3">
      <div className="flex gap-3">
        <MenuItemInfo item={item}>
          <Avatar className="size-12 cursor-pointer rounded-md object-cover hover:opacity-85">
            <AvatarImage src={item.image ?? undefined} />
            <AvatarFallback className="rounded-md">
              {item.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </MenuItemInfo>
        <MenuItemInfo item={item}>
          <div className="grid max-w-[200px] cursor-pointer gap-1 truncate sm:max-w-full">
            <h1 className="truncate text-sm font-medium">{item.name}</h1>

            <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-scroll sm:overflow-hidden">
              <Badge className="flex items-center gap-1">
                <IconCoinRupee className="size-3" />
                {item.price.half}/{item.price.full}
              </Badge>
              <Badge variant="outline">
                {item.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
              </Badge>
              <Badge variant="outline">
                {item.isAvailable ? "Available" : "Not-Available"}
              </Badge>
            </div>
          </div>
        </MenuItemInfo>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="outline" className="bg-card">
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-foreground/70 px-1 py-1 text-xs font-normal">
              Actions
            </DropdownMenuLabel>

            <EditMenuItem
              itemId={item.id}
              prevAvailable={item.isAvailable}
              prevImage={item.image}
              prevName={item.name}
              prevPrice={item.price}
              prevVegetarian={item.isVegetarian}
              prevIngredients={item.ingredients ?? []}
              prevDescription={item.description ?? ""}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit
                <IconPencil className="ml-auto size-3.5" />
              </DropdownMenuItem>
            </EditMenuItem>

            <DeleteItem itemId={item.id}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                variant="destructive"
              >
                Delete
                <IconTrash className="ml-auto size-3.5" />
              </DropdownMenuItem>
            </DeleteItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
