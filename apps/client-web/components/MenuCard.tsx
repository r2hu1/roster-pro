import React from "react"
import { MenuItem } from "@workspace/shared/types/organization/menu/types"
import { Clock } from "lucide-react"
import FormatPrice from "@/util/FormatPrice"

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article
      key={item.id}
      className={`group relative flex flex-col overflow-hidden rounded-xl  bg-card  ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-black/[0.06] ${
        !item.isAvailable ? "opacity-70" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}

        {/* Soft gradient for legibility over image edges */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Veg / non-veg indicator */}
        <span
          className={`absolute left-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-[6px] border-[1.5px] bg-white  backdrop-blur-sm sm:left-3 sm:top-3 ${
            item.isVegetarian ? "border-green-600" : "border-red-600"
          }`}
          title={item.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
        >
          <span
            className={`h-2 w-2 rounded-full ${item.isVegetarian ? "bg-green-600" : "bg-red-600"}`}
          />
        </span>

        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/50 px-2.5 py-1 text-xs font-bold text-gray-800  sm:bottom-3 sm:right-3 sm:text-base">
          {item.category}
        </span>

        {/* Sold out overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
              Not available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex  flex-1 flex-col p-3.5 sm:p-4">
        <div>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
            {item.name}
          </h3>

          {/* Meta row: category + prep time */}
          {(item.category || item.preparationTime) && (
            <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 text-xs text-muted-foreground">
              {/* {item.category && <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{item.category}</span>} */}
              {item.preparationTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {item.preparationTime} min
                </span>
              )}
            </div>
          )}
        </div>
        {/* Price badge */}
        <div className="absolute bottom-2.5 right-2.5 rounded-full  px-2.5 py-1 text-sm font-bold text-foreground backdrop-blur-sm sm:bottom-3 sm:right-3 sm:text-base">
          {FormatPrice(item.price)}
        </div>
      </div>
    </article>
  )
}
