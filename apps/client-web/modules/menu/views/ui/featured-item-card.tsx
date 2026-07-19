import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import Image from "next/image"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowUpRight } from "reicon-react"
import ResponsiveItemModal from "./responsive-item-modal"

export function VegIndicator({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded-[3px] border bg-white/95",
        isVegetarian ? "border-green-600" : "border-red-600"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isVegetarian ? "bg-green-600" : "bg-red-600"
        )}
      />
    </span>
  )
}

export default function FeaturedMenuItemCard({
  item,
}: {
  item: MenuItemResponse
}) {
  return (
    <ResponsiveItemModal item={item}>
      <div className="group relative aspect-[6/5] overflow-hidden rounded-lg cursor-pointer transition-shadow duration-300 sm:aspect-[16/10]">
        <Image
          src={item.image ?? "/assets/menu-item-placeholder.png"}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <VegIndicator isVegetarian={item.isVegetarian} />
          {item.preparationTime && (
            <Badge
              variant="secondary"
              className="bg-white/90 text-foreground backdrop-blur"
            >
              {item.preparationTime} min
            </Badge>
          )}
        </div>

        {/*<span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-foreground backdrop-blur">
          Featured
        </span>*/}

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h2 className="font-serif text-lg leading-tight text-white line-clamp-1 sm:text-3xl">
            {item.name}
          </h2>

          {item.description && (
            <p className="mt-1.5 text-xs text-white/75 line-clamp-2 max-w-md">
              {item.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2 text-white">
              <span className="text-sm font-semibold">₹{item.price.half}</span>
              <span className="text-sm text-white/60">
                / Full ₹{item.price.full}
              </span>
            </div>

            <Button
              size="sm"
              variant="secondary"
              className="gap-1 bg-white/95 text-foreground hover:bg-white"
            >
              View
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveItemModal>
  )
}
