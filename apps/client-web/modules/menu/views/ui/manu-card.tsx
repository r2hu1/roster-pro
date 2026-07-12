import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { IconArrowUpRight, IconShoppingCartPlus } from "@tabler/icons-react"
import { useViewType } from "../providers/view-type"
import ResponsiveItemModal from "./responsive-item-modal"

export default function MenuCard({ item }: { item: MenuItemResponse }) {
  const { viewType } = useViewType()
  return (
    <ResponsiveItemModal item={item}>
      {viewType === "grid" ? (
        <div className="group flex flex-col gap-3 cursor-pointer border rounded-lg min-h-full">
          <div className="relative aspect-square overflow-hidden rounded-md bg-muted rounded-b-none">
            <Image
              src={item.image ?? "/assets/menu-item-placeholder.png"}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-b-none"
            />

            <div className="absolute left-2 bottom-2 flex gap-2 items-center">
              {item.preparationTime && (
                <Badge>{item.preparationTime} min</Badge>
              )}

              <Badge variant="secondary" className="size-4 rounded-sm! p-0">
                <span
                  className={
                    "flex size-3 items-center justify-center rounded-[3px] border " +
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
              </Badge>
            </div>
          </div>

          <div className="space-y-1 p-2 pt-0">
            <h3 className="font-medium truncate">{item.name}</h3>

            {item.description && (
              <p className="text-sm text-muted-foreground wrap-break-word line-clamp-1">
                {item.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="bg-primary/10 text-primary flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <span>₹{item.price.half}</span>
                <span className="bg-primary/25 h-3 w-px" />
                <span>₹{item.price.full}</span>
              </div>
              <Button size="icon-sm">
                <IconArrowUpRight />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg flex border overflow-hidden transition hover:shadow-sm">
          <div className="rounded-md rounded-br-none rounded-tr-none max-w-30 relative">
            <Image
              src={item.image ?? "/assets/menu-item-placeholder.png"}
              alt={item.name}
              width={100}
              height={100}
              className="aspect-video object-cover rounded-br-none rounded-tr-none size-full rounded-md"
            />
            <div className="absolute z-10 bottom-0 left-0 right-0 p-2 flex items-center justify-between">
              {item.preparationTime && (
                <Badge>{item.preparationTime} min</Badge>
              )}
              <Badge variant="secondary" className="size-4 rounded-sm! p-0">
                {/*{item.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}*/}
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
              </Badge>
            </div>
          </div>
          <div className="p-2 space-y-3 flex flex-col justify-between w-full">
            <div className="min-w-0 space-y-0.5">
              <h3 className="text-[15px] font-medium truncate w-auto">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground wrap-break-word line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-3">
              <div className="bg-primary/10 w-fit text-primary flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <span>
                  <span className="text-muted-foreground">Half</span> ₹
                  {item.price?.half}
                </span>
                <span className="bg-primary/25 h-3 w-px" />
                <span>
                  <span className="text-muted-foreground">Full</span> ₹
                  {item.price?.full}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  View <IconArrowUpRight />
                </Button>
                <Button size="sm">
                  Add <IconShoppingCartPlus />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveItemModal>
  )
}
