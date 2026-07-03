import React from "react"
import { MenuItem } from "@workspace/shared/types/organization/menu/types"
import MenuCard from "./MenuCard"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Clock, Leaf, Tag, CircleCheck, CircleX, Ham } from "lucide-react"
import FormatPrice from "@/util/FormatPrice"
import MenuAction from "./MenuAction"

export default function Menu({ MenuItems }: { MenuItems: MenuItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {MenuItems.map((item) => (
        <Drawer key={item.id}>
          <DrawerTrigger asChild>
            <button className="text-left">
              <MenuCard item={item} />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-lg">
              {/* Image */}
              {item.image ? (
                <div className="relative aspect-[16/9]  w-full overflow-hidden rounded-t-2xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <Badge
                    variant={item.isAvailable ? "default" : "destructive"}
                    className="absolute right-3 top-3 gap-1"
                  >
                    {item.isAvailable ? (
                      <CircleCheck className="size-3.5" />
                    ) : (
                      <CircleX className="size-3.5" />
                    )}
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              ) : null}

              <DrawerHeader className="text-left">
                {/* Meta badges */}
                <div className="flex items-start justify-between gap-3">
                  <DrawerTitle className="text-xl">{item.name}</DrawerTitle>
                  <span className="whitespace-nowrap text-end text-xl font-semibold tabular-nums">
                    {FormatPrice(item.price)}
                  </span>
                </div>
                <DrawerDescription className="text-left">
                  {item.description ?? "No description provided."}
                </DrawerDescription>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {item.category && (
                    <Badge variant="secondary" className="gap-1">
                      <Tag className="size-3.5" />
                      {item.category}
                    </Badge>
                  )}
                  {item.isVegetarian ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-green-600 text-green-700"
                    >
                      <Leaf className="size-3.5" />
                      Vegetarian
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-red-600 text-red-700"
                    >
                      <Ham className="size-3.5" />
                      Non-Vegetarian
                    </Badge>
                  )}
                  {item.preparationTime != null && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="size-3.5" />
                      {item.preparationTime} min
                    </Badge>
                  )}
                  {!item.image && (
                    <Badge
                      variant={item.isAvailable ? "default" : "destructive"}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  )}
                </div>
              </DrawerHeader>

              <div className="space-y-4 px-4">
                {/* Ingredients */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.ingredients.map((ingredient) => (
                        <Badge key={ingredient} variant="outline">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DrawerFooter className="flex-row gap-2">
                {item.isAvailable && (
                  <>
                    <MenuAction />
                  </>
                )}
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  )
}
