import React from "react"
import { Sheet, SheetTrigger } from "@workspace/ui/components/sheet"
import { Search, Settings2 } from "lucide-react"
import Filter, { type FilterValues } from "./Filter"
import type { Menu } from "@workspace/shared/types/organization/menu/types"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  menus: Menu[]
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  maxPrice: number
}

export default function SearchBar({
  value,
  onChange,
  menus,
  filters,
  onFiltersChange,
  maxPrice,
}: SearchBarProps) {
  return (
    <div className="flex w-full max-w-4xl items-center gap-2 py-8 lg:py-15">
      <label className="flex h-12 flex-1 items-center rounded-full border border-border bg-primary/5 pl-4 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="mr-3 h-5 w-5 text-primary" />

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search menu..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </label>
      <Sheet>
        <SheetTrigger>
          <button className="flex h-12 w-12 items-center justify-center gap-2 rounded-full border-2 border-primary/50 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary">
            <Settings2 size={20} />
          </button>
        </SheetTrigger>

        <Filter
          menus={menus}
          value={filters}
          onApply={onFiltersChange}
          maxPrice={maxPrice}
        />
      </Sheet>
    </div>
  )
}
