import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import { Badge } from "@workspace/ui/components/badge"
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@workspace/ui/components/responsive-modal"
import { IconCoinRupee } from "@tabler/icons-react"

export default function MenuItemInfo({
  item,
  children,
}: {
  item: MenuItemResponse
  children: React.ReactNode
}) {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Viewing</span>
            {item.name}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <div className="space-y-4 pb-10 sm:pb-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-[250px] w-full rounded-md object-cover"
              />
            ) : (
              <div className="bg-muted flex h-[250px] w-full items-center justify-center rounded-md">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}
            <div className="space-y-2">
              <h1 className="flex items-center justify-between text-lg font-medium">
                {item.name}
                <Badge className="flex items-center gap-1">
                  <IconCoinRupee className="size-3.5" />
                  {item.price.half}/{item.price.full}
                </Badge>
              </h1>
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient, i) => (
                    <Badge key={i} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              )}
              {!item.description ? (
                <p className="text-muted-foreground text-sm">
                  No description added.
                </p>
              ) : (
                <p className="text-foreground/80 text-sm">{item.description}</p>
              )}
            </div>
            {item.updatedAt && (
              <p className="text-muted-foreground text-sm">
                Last Updated On:{" "}
                <span className="text-foreground">
                  {new Date(item.updatedAt).toDateString()}
                </span>
              </p>
            )}
          </div>
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
