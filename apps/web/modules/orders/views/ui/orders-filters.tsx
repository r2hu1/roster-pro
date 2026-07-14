import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import { IconSearch } from "@tabler/icons-react"
import { OrderStatus } from "@workspace/shared/enums"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"

export function OrdersFilters({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
}: {
  activeFilter: string
  onFilterChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
}) {
  const { kitchenMode } = useKitchenMode()
  const filters = [
      "All",
      "Pending",
      "Preparing",
      "Ready",
      "Served",
      "Completed",
      "Cancelled",
    ];

  if (kitchenMode) {
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex w-full rounded-xl border overflow-x-scroll no-scrollbar">
          {filters.map((f) => (
            <Button
              key={f}
              variant="ghost"
              className={cn(
                "rounded-none min-w-20 capitalize flex-1 h-14 border-none text-base font-semibold",
                activeFilter === f && "bg-primary! text-primary-foreground!"
              )}
              onClick={() => onFilterChange(f)}
            >
              {f}
            </Button>
          ))}
        </div>
        <InputGroup className="w-full md:max-w-xs h-14 px-3">
          <InputGroupInput
            placeholder="Search orders..."
            className="h-14 text-base placeholder:text-neutral-500"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroupAddon>
            <IconSearch className="text-neutral-500" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex no-scrollbar md:min-w-fit w-full md:w-auto rounded-md bg-sidebar overflow-x-auto md:overflow-hidden scrollbar-none">
        {filters.map((f) => (
          <Button
            size="lg"
            key={f}
            variant="secondary"
            className={cn(
              "rounded-none capitalize shrink-0",
              activeFilter === f && "bg-primary/15! text-primary!"
            )}
            onClick={() => onFilterChange(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <InputGroup className="w-full">
        <InputGroupInput
          placeholder="Search orders..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
