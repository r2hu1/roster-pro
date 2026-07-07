"use client";

import React from "react";
import SearchBar from "./view/ui/Search/SearchBar";
import Menu from "./view/ui/MenuLayout/Menu";
import type { MenuItem } from "@workspace/shared/types/organization/menu/types";
import { useQuery } from "@tanstack/react-query";
import { menuItems } from "@/dummy/menu"; // remove this one API is integrated


export default function MenuPage() {
    const { data, isLoading, isError } = useQuery<MenuItem[]>({
        queryKey: ["foodItems"],
        queryFn: getMenuItems,
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error</div>;
    return (
        <>
            <div className="flex w-full items-center justify-center">
                <SearchBar />
            </div>
            <Menu MenuItems={data ?? []} />
        </>
    );
}

// simulate an API call
async function getMenuItems(): Promise<MenuItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return menuItems;
}
