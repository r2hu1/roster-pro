"use client";

import React, { useCallback, useEffect, useState } from "react";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@workspace/ui/components/sheet";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Label } from "@workspace/ui/components/label";
import { Slider } from "@workspace/ui/components/slider";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Menu } from "@workspace/shared/types/organization/menu/types";
import { Check, ChevronDown, UtensilsCrossed, Wallet, PackageCheck, ArrowUpDown, Star, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { Separator } from "@workspace/ui/components/separator";
import FormatPrice from "@/util/FormatPrice";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "most popular", label: "Most Popular" },
    { value: "Time Low", label: "Time: Low to High" },
];

export default function Filter({ menus }: { menus: Menu[] }) {
    const [menu, setMenu] = useState<string[]>(["All"]);
    const [price, setPrice] = useState<number>(500);
    const [availability, setAvailability] = useState(false);
    const [sortBy, setSortBy] = useState("featured");

    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
    const [isSortByOpen, setIsSortByOpen] = useState(true);

    const activeCount =
        (menu.length && !(menu.length === 1 && menu[0] === "All") ? 1 : 0) +
        (price !== 500 ? 1 : 0) +
        (availability ? 1 : 0) +
        (sortBy !== "featured" ? 1 : 0);

    const clearFilters = useCallback(() => {
        setMenu(["All"]);
        setPrice(500);
        setAvailability(false);
        setSortBy("featured");
    }, []);

    const toggleMenu = useCallback((menuOption: string) => {
        if (menuOption === "All") {
            setMenu(["All"]);
            return;
        }
        setMenu((prevMenus) => {
            if (prevMenus.includes(menuOption)) {
                const newMenus = prevMenus.filter((m) => m !== menuOption);
                return newMenus.length === 0 ? ["All"] : newMenus;
            }
            const newMenus = prevMenus.filter((m) => m !== "All");
            return [...newMenus, menuOption];
        });
    }, []);

    const applyFilters = useCallback(() => {
        // Implement the logic to submit the filters, e.g., make an API call or update the state in a parent component
        console.log("Filters submitted:", { menu, price, availability, sortBy });
    }, [menu, price, availability, sortBy]);

    return (
        <SheetContent className="flex flex-col gap-0 p-0">
            <SheetHeader className="space-y-1  px-4 pt-5 ">
                <div className="flex items-center justify-start gap-2">
                    <SheetTitle className="text-lg font-bold tracking-tight">Filters</SheetTitle>
                    {activeCount > 0 && (
                        <Badge variant="secondary" className="rounded-full  px-2.5 py-0.5 text-xs font-medium">
                            {activeCount} active
                        </Badge>
                    )}
                </div>
                <SheetDescription className="text-xs">Narrow down the menu by category, price, availability, and more.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-5">
                <Separator className={"bg-primary/20"}/>
                {/* Menu */}
                <FilterSection
                    icon={<UtensilsCrossed size={15} />}
                    heading="Menu"
                    open={isMenuOpen}
                    onOpenChange={setIsMenuOpen}
                    badge={menu.length && !(menu.length === 1 && menu[0] === "All") ? menu.length : undefined}
                >
                    <div className="flex flex-wrap gap-2">
                        {[{ id: "all", name: "All" }, ...menus].map((menuItem) => {
                            const selected = menu.includes(menuItem.name);
                            return (
                                <button
                                    key={menuItem.id}
                                    onClick={() => toggleMenu(menuItem.name)}
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
                            );
                        })}
                    </div>
                </FilterSection>

                <Separator className={"bg-primary/30"} />

                {/* Price */}
                <FilterSection icon={<Wallet size={15} />} heading="Price Range" open={isPriceOpen} onOpenChange={setIsPriceOpen}>
                    <div className="space-y-4 px-1">
                        <Slider value={price} onValueChange={(value) => setPrice(value as number)} min={0} max={1000} step={10} />
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="rounded-md font-normal text-muted-foreground">
                                {FormatPrice(0)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">up to</span>
                            <Badge variant="outline" className="rounded-md border-primary/40 font-semibold text-primary">
                                {FormatPrice(price)}
                            </Badge>
                        </div>
                    </div>
                </FilterSection>

                <Separator className={"bg-primary/30"} />

                {/* Availability */}
                <FilterSection
                    icon={<PackageCheck size={15} />}
                    heading="Availability"
                    open={isAvailabilityOpen}
                    onOpenChange={setIsAvailabilityOpen}
                >
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3.5 py-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="availability" className="text-sm font-medium">
                                In stock only
                            </Label>
                            <p className="text-xs text-muted-foreground">Hide items that are sold out</p>
                        </div>
                        <Switch id="availability" checked={availability} onCheckedChange={setAvailability} />
                    </div>
                </FilterSection>

                <Separator className={"bg-primary/30"} />

                {/* Sort */}
                <FilterSection icon={<ArrowUpDown size={15} />} heading="Sort By" open={isSortByOpen} onOpenChange={setIsSortByOpen}>
                    <RadioGroup value={sortBy} onValueChange={setSortBy} className="gap-2.5">
                        {SORT_OPTIONS.map((option) => (
                            <Label
                                key={option.value}
                                htmlFor={option.value}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-normal transition-colors",
                                    sortBy === option.value ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/40"
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
                <Button variant="ghost" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                    <RotateCcw size={14} />
                    Clear all
                </Button>
                <Button onClick={applyFilters} className="flex-1 sm:flex-none sm:px-8">Apply Filters</Button>
            </SheetFooter>
        </SheetContent>
    );
}

function FilterSection({
    icon,
    heading,
    open,
    onOpenChange,
    badge,
    children,
}: {
    icon: React.ReactNode;
    heading: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    badge?: number;
    children: React.ReactNode;
}) {
    return (
        <Collapsible open={open} onOpenChange={onOpenChange} className="space-y-3.5">
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg py-1 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
                    {heading}
                    {!!badge && (
                        <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px] font-medium">
                            {badge}
                        </Badge>
                    )}
                </span>
                <ChevronDown size={16} className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}
