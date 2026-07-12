"use client"

import { useMenus } from "@/hooks/use-menus"
import MenuCard from "@/modules/menu/views/ui/manu-card"
import { useTableContext } from "@/modules/providers/table-provider"
import { IconSearch } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/ui/components/input-group"

export default function MenuPageView() {
  const { data, isPending, error } = useTableContext()
  const {
    data: menus,
    isPending: menusPending,
    error: menusError,
  } = useMenus(data?.organization.id)

  if (isPending || menusPending) return <div>Loading...</div>
  if (menusError) return <div>Error: {menusError.message}</div>

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <IconSearch/>
          </InputGroupAddon>
        </InputGroup>
      <div className="flex gap-2 items-center overflow-x-scroll no-scrollbar">
        {menus?.filter((menu) => menu.items.length).map((menu) => (
          <Button className="rounded-full border-border!" variant="outline" key={menu.id}>{menu.menu}</Button>
        ))}
      </div>
      </div>
      <div className="grid gap-8">
        {menus?.filter((menu) => menu.items.length).map((menu) => (
          <section key={menu.id} className="grid gap-3">
            <h2 className="text-xs font-medium">{menu.menu}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:grid-cols-5">
              {menu.items?.map((item) => (
                <div
                  key={item.id}
                  className="break-inside-avoid inline-block w-full"
                >
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
