import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import { Badge } from "@workspace/ui/components/badge"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import Image from "next/image"

export default function MenuItemInfo({
  item,
  children,
}: {
  item: MenuItemResponse
  children: React.ReactNode
}) {
  return (
    <Sheet>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Viewing</span>
            {item.name}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 p-6 pt-0">
          {item.image ? (
            <Image
              height={10}
              width={10}
              src={item.image}
              alt={item.name}
              className="h-[250px] w-full rounded-md object-cover"
            />
          ) : (
            <div className="bg-muted flex h-[250px] w-full items-center justify-center rounded-md">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={
                    "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border " +
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
                <h1 className="truncate text-lg font-medium">{item.name}</h1>
              </div>

              <div className="bg-primary/10 text-primary flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <span>₹{item.price.half}</span>
                <span className="bg-primary/25 h-3 w-px" />
                <span>₹{item.price.full}</span>
              </div>
            </div>

            {item.ingredients && item.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.ingredients.map((ingredient, i) => (
                  <Badge key={i} variant="secondary">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            )}

            {item.preparationTime && <Badge variant="outline" className="bg-transparent!">Preparation Time - {item.preparationTime} minutes</Badge>}

            {!item.description ? (
              <p className="text-muted-foreground mt-4! text-sm">
                No description added.
              </p>
            ) : (
              <p className="text-foreground/80 mt-4 text-sm">
                {item.description}
              </p>
            )}
          </div>
        </div>
        <SheetFooter className="flex items-center justify-between flex-row">
          {item.updatedAt && (
            <p className="text-muted-foreground text-[13px]">
              Last Updated On:{" "}
              <span className="text-foreground">
                {new Date(item.updatedAt).toDateString()}
              </span>
            </p>
          )}
          <Badge variant="outline">
            {item.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
