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
  excludeCompleted,
}: {
  activeFilter: string
  onFilterChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
  excludeCompleted?: boolean
}) {
  const filters = excludeCompleted
    ? ["All", "Pending", "Preparing", "Ready", "Served", "Cancelled"]
    : [
        "All",
        "Pending",
        "Preparing",
        "Ready",
        "Served",
        "Completed",
        "Cancelled",
      ]

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
          placeholder="Search orders by number..."
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
