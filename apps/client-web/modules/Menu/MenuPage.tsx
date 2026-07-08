"use client";

import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "./view/ui/Search/SearchBar";
import Menu from "./view/ui/MenuLayout/Menu";
import type { MenuItem } from "@workspace/shared/types/organization/menu/types";
import { useQuery } from "@tanstack/react-query";
import { menuItems as seedMenuItems, menus as menuGroups } from "@/dummy/menu";
import type { FilterValues } from "./view/ui/Search/Filter";
import Header from "./view/ui/Top/Header";
import { restaurantData } from "@/dummy/Restaurant";
import SkeletonLoader from "./view/ui/Skeleton";


// simulate an API call for menu
async function getMenuItems(): Promise<MenuItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return seedMenuItems;
}

// simulate an API call for restaurant
async function getRestaurantData() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return restaurantData;
}

const DEFAULT_FILTERS: FilterValues = {
    menuIds: [],
    price: 2500,
    availability: false,
    sortBy: "featured",
};

type dataType = {
    menuItems: MenuItem[]
    restaurant: { name: string; address: string; logoUrl: string }
} 

export default function MenuPage() {
    const { data, isLoading, isError } = useQuery<dataType>({
        queryKey: ["foodItems"],
        queryFn: async () => {
            const [menuItems, restaurant] = await Promise.all([getMenuItems(), getRestaurantData()]);
            return { menuItems, restaurant };
        },
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

    const maxPrice = useMemo(() => {
        const items = data?.menuItems ?? seedMenuItems;
        return Math.max(2500, ...items.map((item) => item.price.full));
    }, [data]);

    useEffect(() => {
        setFilters((currentFilters) => (currentFilters.price > maxPrice ? { ...currentFilters, price: maxPrice } : currentFilters));
    }, [maxPrice]);

    const filteredItems = useMemo(() => {
        const items = data?.menuItems ?? [];
        const normalizedQuery = searchQuery.trim().toLowerCase();

        const filtered = items.filter((item) => {
            const matchesQuery =
                normalizedQuery.length === 0 ||
                [item.name, item.description, item.category, ...(item.ingredients ?? [])].join(" ").toLowerCase().includes(normalizedQuery);

            const matchesMenu = filters.menuIds.length === 0 || filters.menuIds.includes(item.menuId);
            const matchesPrice = item.price.full <= filters.price;
            const matchesAvailability = !filters.availability || item.isAvailable;

            return matchesQuery && matchesMenu && matchesPrice && matchesAvailability;
        });

        const sorted = [...filtered];

        switch (filters.sortBy) {
            case "price-low":
                sorted.sort((a, b) => a.price.full - b.price.full);
                break;
            case "price-high":
                sorted.sort((a, b) => b.price.full - a.price.full);
                break;
            case "Time Low":
                sorted.sort((a, b) => (a.preparationTime ?? 0) - (b.preparationTime ?? 0));
                break;
            default:
                break;
        }

        return sorted;
    }, [data, filters, searchQuery]);

    if (isLoading) return <SkeletonLoader/>;
    if (isError || !data?.restaurant || !data?.menuItems) return <div>Error</div>;

    return (
        <div className="bg-background p-2 lg:py-8 lg:px-18">
            <Header data={data?.restaurant} />
            <div className="flex w-full items-center justify-center">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    menus={menuGroups}
                    filters={filters}
                    onFiltersChange={setFilters}
                    maxPrice={maxPrice}
                />
            </div>
            {filteredItems.length > 0 ? (
                <Menu MenuItems={filteredItems} />
            ) : (
                <div className="mt-8 text-center text-sm text-muted-foreground">No menu items match your current search and filters.</div>
            )}
        </div>
    );
}

