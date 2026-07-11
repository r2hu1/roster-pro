"use client"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
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
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react"
import EditMenuItem from "./edit-menu-item"
import DeleteItem from "./delete-menu-item"
import MenuItemInfo from "./menu-item-info"
import { useState } from "react"

export default function ItemCard({ item }: { item: MenuItemResponse }) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="bg-card group flex items-center justify-between gap-3 rounded-md border p-2 pr-3 transition-colors duration-200 hover:shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MenuItemInfo item={item}>
          <Avatar className="ring-border/60 size-12 cursor-pointer rounded-md object-cover ring-1 transition-opacity hover:opacity-85">
            <AvatarImage
              className="rounded-md!"
              src={item.image ?? undefined}
            />
            <AvatarFallback className="rounded-md">
              {item.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </MenuItemInfo>

        <MenuItemInfo item={item}>
          <div className="grid min-w-0 cursor-pointer gap-1 text-left">
            <div className="flex items-center gap-1.5">
              <span
                className={
                  "flex size-3 shrink-0 items-center justify-center rounded-[3px] border " +
                  (item.isVegetarian ? "border-green-600" : "border-red-600")
                }
              >
                <span
                  className={
                    "size-1.5 rounded-full " +
                    (item.isVegetarian ? "bg-green-600" : "bg-red-600")
                  }
                />
              </span>
              <h1 className="truncate text-sm font-medium">{item.name}</h1>
            </div>

            <div className="flex flex-nowrap items-center gap-2">
              <span
                className={
                  "text-xs " +
                  (item.isAvailable
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60 line-through decoration-muted-foreground/40")
                }
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </MenuItemInfo>
      </div>

      {/* Price pill */}
      <div className="bg-primary/10 text-primary flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
        <span>₹{item.price.half}</span>
        <span className="bg-primary/25 h-3 w-px" />
        <span>₹{item.price.full}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="secondary"
            className="bg-card shrink-0"
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-foreground/70 px-1 py-1 text-xs font-normal">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setEditOpen(true)
              }}
            >
              Edit
              <IconPencil className="ml-auto size-3.5" />
            </DropdownMenuItem>
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

      <EditMenuItem
        open={editOpen}
        onOpenChange={setEditOpen}
        itemId={item.id}
        prevAvailable={item.isAvailable}
        prevImage={item.image}
        prevName={item.name}
        prevPrice={item.price}
        prevVegetarian={item.isVegetarian}
        prevIngredients={item.ingredients ?? []}
        prevDescription={item.description ?? ""}
      />
    </div>
  )
}
