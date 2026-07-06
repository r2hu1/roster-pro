import { IconSearch } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"
import { filters } from "./orders-constants"

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
        {filters.map((f) => (
          <Button
            size="lg"
            key={f.value}
            variant="secondary"
            className={cn(
              "rounded-none",
              activeFilter === f.value && "bg-primary/15! text-primary!"
            )}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
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
