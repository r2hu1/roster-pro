"use client"

import {
  IconGrid3x3,
  IconLayoutGrid,
  IconLayoutList,
  IconListFilled,
  IconSearch,
} from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { useViewType } from "../providers/view-type"
import { Grid, List3, Search } from "reicon-react"

interface Menu {
  id: string
  menu: string
  items: any[]
}

interface Props {
  menus: Menu[]
  activeMenuId: string | null
  onMenuClick: (menuId: string) => void
  buttonsRef: React.MutableRefObject<Map<string, HTMLButtonElement>>
  tabsContainerRef: React.RefObject<HTMLDivElement | null>
  searchQuery: string
  onSearchChange: (value: string) => void
}

export default function MenuFilterBar({
  menus,
  activeMenuId,
  onMenuClick,
  buttonsRef,
  tabsContainerRef,
  searchQuery,
  onSearchChange,
}: Props) {
  const { viewType, setViewType } = useViewType()

  return (
    <div className="space-y-3 px-6 sticky top-0 isolate bg-background z-20 py-4">
      <div className="flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Button
          size="icon-lg"
          type="button"
          onClick={() => setViewType(viewType === "list" ? "grid" : "list")}
        >
          {viewType === "list" ? <Grid /> : <List3 />}
        </Button>
      </div>
      <div
        ref={tabsContainerRef}
        className="flex gap-2 items-center overflow-x-scroll no-scrollbar"
      >
        {menus
          .filter((menu) => menu.items.length)
          .map((menu) => (
            <Button
              key={menu.id}
              ref={(el) => {
                if (el) buttonsRef.current.set(String(menu.id), el)
                else buttonsRef.current.delete(String(menu.id))
              }}
              className="rounded-full border-border!"
              variant={activeMenuId === String(menu.id) ? "default" : "outline"}
              onClick={() => onMenuClick(String(menu.id))}
            >
              {menu.menu}
            </Button>
          ))}
      </div>
    </div>
  )
}
