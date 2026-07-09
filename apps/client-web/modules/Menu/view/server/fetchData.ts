import axios from "axios";
import type { MenuItem } from "@workspace/shared/types/organization/menu/types";

type Table = {
    orgId: string;
    orgName: string;
    orgLogo: string | null;
    orgAddress: string;
    tableId: string;
    tableNumber: number | null;
};

type Category = {
    id: string;
    name: string;
};

export type TableDataResponse = {
    table: Table;
    menu: MenuItem[];
    category: Category[];
};

export default async function getTableData(id: string): Promise<TableDataResponse> {
    try {
        const tableRes = await axios.get(`/api/organization/table/token/decode?token=${id}`);

        if (tableRes.data?.code !== 200) {
            throw new Error(tableRes.data?.message ?? "Unable to fetch table information.");
        }

        const table: Table = {
            orgId: tableRes.data.data.organization.id,
            orgName: tableRes.data.data.organization.name,
            orgLogo: tableRes.data.data.organization.logo,
            orgAddress: tableRes.data.data.organization.address,
            tableId: tableRes.data.data.table.id,
            tableNumber: tableRes.data.data.table.number,
        };

        const menuRes = await axios.post("/api/organization/menu/all", {
            organizationId: table.orgId,
        });

        if (menuRes.data?.code !== 200) {
            throw new Error(menuRes.data?.message ?? "Unable to fetch menu.");
        }

        const categories: Category[] = [];
        const menuItems: MenuItem[] = [];

        for (const category of menuRes.data.data ?? []) {
            categories.push({
                id: category.id,
                name: category.menu,
            });

            for (const food of category.items ?? []) {
                menuItems.push({
                    ...food,
                    category: food.category ?? category.menu,
                });
            }
        }

        return {
            table,
            menu: menuItems,
            category: categories,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message ?? error.message ?? "Network request failed.");
        }

        throw error instanceof Error ? error : new Error("Unknown error occurred.");
    }
}
