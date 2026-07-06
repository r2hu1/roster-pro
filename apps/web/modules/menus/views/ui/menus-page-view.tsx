"use client"

import EmptyData from "@/components/empty"
import api from "@/lib/axios"
import { IconCirclePlus, IconToolsKitchen2Off } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { MenuResponse } from "@workspace/shared/schemas/menu/response"
import { Button } from "@workspace/ui/components/button"
import CreateMenuModal from "./create-menu-responsive-modal"
import { Skeleton } from "@workspace/ui/components/skeleton"
import MenuCard from "./menu-card"
import PageHeader from "@/components/page-header"

export default function MenusPageView() {
  const {
    data: menus,
    isPending: menusLoading,
    error: menusError,
  } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const req = await api.get("/organization/menu")
      return req.data.data as MenuResponse[]
    },
  })
  return (
    <div>
      <PageHeader
        title="Menus"
        actions={
          <CreateMenuModal>
            <Button>
              Create Menu <IconCirclePlus />
            </Button>
          </CreateMenuModal>
        }
      />
      {menusLoading && <Skeleton className="h-100 w-full" />}
      {!menusLoading && !menus && (
        <EmptyData
          title="No menu added yet."
          description="Start by creating your first menu, click the button below to get started."
          action={
            <CreateMenuModal>
              <Button size="lg">
                Create Menu <IconCirclePlus />
              </Button>
            </CreateMenuModal>
          }
          icon={<IconToolsKitchen2Off />}
        />
      )}
      <div className="flex flex-wrap items-stretch gap-3.5 [&>*]:basis-full sm:[&>*]:basis-[calc(50%-1.5rem)] md:[&>*]:basis-[calc(33.333%-1.5rem)] lg:[&>*]:basis-[calc(25%-1.5rem)]">
        {!menusLoading &&
          menus &&
          menus.map((d, i) => <MenuCard key={i} menu={d} />)}
      </div>
    </div>
  )
}
