"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@workspace/ui/components/sheet"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { Slider } from "@workspace/ui/components/slider"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Menu } from "@workspace/shared/types/organization/menu/types"
import {
  Check,
  ChevronDown,
  UtensilsCrossed,
  Wallet,
  PackageCheck,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Separator } from "@workspace/ui/components/separator"
import FormatPrice from "@/lib/format-price"
import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"

export type FilterValues = {
  menuIds: string[]
  price: number
  availability: boolean
  sortBy: string
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "most popular", label: "Most Popular" },
  { value: "Time Low", label: "Time: Low to High" },
]

type FilterProps = {
  menus: { id: string; name: string }[]
  value: FilterValues
  onApply: (filters: FilterValues) => void
  maxPrice?: number
}

export default function Filter({
  menus,
  value,
  onApply,
  maxPrice = 2500,
}: FilterProps) {
  const [menuIds, setMenuIds] = useState<string[]>(value.menuIds)
  const [price, setPrice] = useState<number>(value.price)
  const [availability, setAvailability] = useState(value.availability)
  const [sortBy, setSortBy] = useState(value.sortBy)
  const [isSIdeOpen, setIsSideOpen] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [isPriceOpen, setIsPriceOpen] = useState(true)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true)
  const [isSortByOpen, setIsSortByOpen] = useState(true)

  useEffect(() => {
    setMenuIds(value.menuIds)
    setPrice(value.price)
    setAvailability(value.availability)
    setSortBy(value.sortBy)
  }, [value])

  const activeCount =
    (menuIds.length > 0 ? 1 : 0) +
    (price < maxPrice ? 1 : 0) +
    (availability ? 1 : 0) +
    (sortBy !== "featured" ? 1 : 0)

  const clearFilters = useCallback(() => {
    const resetFilters: FilterValues = {
      menuIds: [],
      price: maxPrice,
      availability: false,
      sortBy: "featured",
    }

    setMenuIds(resetFilters.menuIds)
    setPrice(resetFilters.price)
    setAvailability(resetFilters.availability)
    setSortBy(resetFilters.sortBy)
    onApply(resetFilters)
  }, [maxPrice, onApply])

  const toggleMenu = useCallback((menuOptionId: string) => {
    if (menuOptionId === "all") {
      setMenuIds([])
      return
    }

    setMenuIds((prevMenuIds) => {
      if (prevMenuIds.includes(menuOptionId)) {
        const nextMenuIds = prevMenuIds.filter((id) => id !== menuOptionId)
        return nextMenuIds.length === 0 ? [] : nextMenuIds
      }

      return [...prevMenuIds.filter((id) => id !== "all"), menuOptionId]
    })
  }, [])

  const applyFilters = useCallback(() => {
    onApply({ menuIds, price, availability, sortBy })
  }, [menuIds, price, availability, sortBy, onApply])

  return (
    <SheetContent className="flex flex-col gap-0 p-0">
      <SheetHeader className="space-y-1 px-4 pt-5">
        <div className="flex items-center justify-start gap-2">
          <SheetTitle className="text-lg font-bold tracking-tight">
            Filters
          </SheetTitle>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {activeCount} active
            </Badge>
          )}
        </div>
        <SheetDescription className="text-xs">
          Narrow down the menu by category, price, availability, and more.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-5">
        <Separator className={"bg-primary/20"} />
        <FilterSection
          icon={<UtensilsCrossed size={15} />}
          heading="Menu"
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          badge={menuIds.length > 0 ? menuIds.length : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", name: "All" }, ...menus].map((menuItem) => {
              const selected =
                menuItem.id === "all"
                  ? menuIds.length === 0
                  : menuIds.includes(menuItem.id)
              return (
                <button
                  key={menuItem.id}
                  onClick={() => toggleMenu(menuItem.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-foreground/80 hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  {selected && <Check size={13} strokeWidth={2.5} />}
                  {menuItem.name}
                </button>
              )
            })}
          </div>
        </FilterSection>

        <Separator className={"bg-primary/30"} />

        <FilterSection
          icon={<Wallet size={15} />}
          heading="Price Range"
          open={isPriceOpen}
          onOpenChange={setIsPriceOpen}
        >
          <div className="space-y-4 px-1">
            <Slider
              value={[price]}
              onValueChange={(value) => {
                const nextValue = Array.isArray(value) ? value[0] : value
                setPrice(nextValue ?? maxPrice)
              }}
              min={0}
              max={maxPrice}
              step={10}
            />
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="rounded-md font-normal text-muted-foreground"
              >
                {FormatPrice(0)}
              </Badge>
              <span className="text-xs text-muted-foreground">up to</span>
              <Badge
                variant="outline"
                className="rounded-md border-primary/40 font-semibold text-primary"
              >
                {FormatPrice(price)}
              </Badge>
            </div>
          </div>
        </FilterSection>

        <Separator className={"bg-primary/30"} />

        <FilterSection
          icon={<PackageCheck size={15} />}
          heading="Availability"
          open={isAvailabilityOpen}
          onOpenChange={setIsAvailabilityOpen}
        >
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3.5 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="availability" className="text-sm font-medium">
                Available Foods Only
              </Label>
              <p className="text-xs text-muted-foreground">
                Hide items that are no longer available
              </p>
            </div>
            <Switch
              id="availability"
              checked={availability}
              onCheckedChange={setAvailability}
            />
          </div>
        </FilterSection>

        <Separator className={"bg-primary/30"} />

        <FilterSection
          icon={<ArrowUpDown size={15} />}
          heading="Sort By"
          open={isSortByOpen}
          onOpenChange={setIsSortByOpen}
        >
          <RadioGroup
            value={sortBy}
            onValueChange={setSortBy}
            className="gap-2.5"
          >
            {SORT_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-normal transition-colors",
                  sortBy === option.value
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
        </FilterSection>
      </div>

      <SheetFooter className="flex-row gap-2 border-t px-6 py-4 sm:justify-between">
        <SheetClose className={"w-full"}>
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-1.5 w-full border! border-muted-foreground/50! text-muted-foreground"
          >
            <RotateCcw size={14} />
            Clear all
          </Button>
        </SheetClose>
        <SheetClose className={"w-full"}>
          <Button
            onClick={applyFilters}
            className="flex-1 w-full sm:flex-none sm:px-8"
          >
            Apply Filters
          </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  )
}

function FilterSection({
  icon,
  heading,
  open,
  onOpenChange,
  badge,
  children,
}: {
  icon: React.ReactNode
  heading: string
  open: boolean
  onOpenChange: (open: boolean) => void
  badge?: number
  children: React.ReactNode
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="space-y-3.5"
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg py-1 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          {heading}
          {!!badge && (
            <Badge
              variant="secondary"
              className="rounded-full px-1.5 py-0 text-[10px] font-medium"
            >
              {badge}
            </Badge>
          )}
        </span>
        <ChevronDown
          size={16}
          className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
