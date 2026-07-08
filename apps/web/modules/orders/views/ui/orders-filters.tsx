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
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-fit rounded-md bg-sidebar overflow-hidden">
        <Button
          size="lg"
          variant="secondary"
          className={cn(
            "rounded-none capitalize",
            activeFilter === "All" && "bg-primary/15! text-primary!"
          )}
          onClick={() => onFilterChange("All")}
        >
          All
        </Button>
        {OrderStatus.options.map((f) => (
          <Button
            size="lg"
            key={f}
            variant="secondary"
            className={cn(
              "rounded-none capitalize",
              activeFilter === f && "bg-primary/15! text-primary!"
            )}
            onClick={() => onFilterChange(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <InputGroup>
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
