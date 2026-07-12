import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { IconArrowUpRight } from "@tabler/icons-react"

export default function MenuCard({ item }: { item: MenuItemResponse }) {
  return (
    <div className="rounded-lg border overflow-hidden transition hover:shadow-sm">
      <div className="rounded-md rounded-b-none relative">
        <Image
          src={item.image ?? "/assets/menu-item-placeholder.png"}
          alt={item.name}
          width={50}
          height={50}
          className="aspect-video object-cover rounded-b-none size-full rounded-md"
        />
        <div className="absolute z-10 bottom-0 left-0 right-0 p-2 flex items-center justify-between">
          {item.preparationTime && <Badge>{item.preparationTime} min</Badge>}
          <Badge variant="secondary" className="border-border">
            {item.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
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
      <div className="p-2 space-y-3 flex flex-col justify-between w-full truncate">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-[15px] font-medium truncate w-auto">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground text-wrap">
            {item.description}
          </p>
        </div>
        <div className="flex items-center flex-wrap justify-between gap-3">
          <div className="bg-primary/10 text-primary flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
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
          <Button size="sm">
            View <IconArrowUpRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
