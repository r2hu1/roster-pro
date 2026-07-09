"use client";

import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "./view/ui/Search/SearchBar";
import Menu from "./view/ui/MenuLayout/Menu";
import type { MenuItem } from "@workspace/shared/types/organization/menu/types";
import type { FilterValues } from "./view/ui/Search/Filter";
import Header from "./view/ui/Top/Header";
import SkeletonLoader from "./view/ui/Skeleton";

import { menuItems as seedMenuItems, menus as menuGroups } from "@/dummy/menu";
import { restaurantData } from "@/dummy/Restaurant";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import getTableData from "./view/server/fetchData";
// import { useContextValue } from "@/components/ContextProvide";

const DEFAULT_FILTERS: FilterValues = {
    menuIds: [],
    price: 2500,
    availability: false,
    sortBy: "featured",
};

export default function MenuPage({ id }: { id: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

    // const { getTableData } = useContextValue();

    const { data, isLoading, isError } = useQuery({
        queryKey: [`menu-${id}`],
        queryFn: async () => await getTableData(id),
    });

    console.log(data);

    const maxPrice = useMemo(() => {
        return Math.max(2500, ...(data?.menu.map((item) => item.price.full) ?? []));
    }, [data]);

    useEffect(() => {
        setFilters((currentFilters) => (currentFilters.price > maxPrice ? { ...currentFilters, price: maxPrice } : currentFilters));
    }, [maxPrice]);

    const filteredItems = useMemo(() => {
        const menuItems = data?.menu ?? [];

        const normalizedQuery = searchQuery.trim().toLowerCase();

        const filtered = menuItems.filter((item) => {
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
        }

        return sorted;
    }, [data, filters, searchQuery]);

    if (isLoading) {
        return <SkeletonLoader />;
    }
    if(isError) {
        return <div>Error</div>
    }

    return (
        <div className="bg-background p-2 lg:px-18 lg:py-8">
            <Header
                data={{
                    name: data?.table.orgName || "",
                    address: data?.table.orgAddress || "",
                    logoUrl: data?.table.orgLogo || "",
                }}
            />

            <div className="flex w-full items-center justify-center">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    menus={[...data?.category ?? []]}
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
