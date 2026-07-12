"use client"

import { IconSearch } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

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
  return (
    <div className="space-y-3 px-6 sticky top-0 bg-background z-20 py-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
      </InputGroup>
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
