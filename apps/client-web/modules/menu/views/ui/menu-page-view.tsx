"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { useMenus } from "@/hooks/use-menus"
import MenuCard from "@/modules/menu/views/ui/manu-card"
import { useTableContext } from "@/modules/providers/table-provider"
import { IconSearch } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

const STICKY_HEADER_HEIGHT = 96

type Row =
  | { type: "header"; menuId: string; title: string }
  | { type: "items"; menuId: string; items: any[] }

function useColumns() {
  const [columns, setColumns] = useState(1)
  useEffect(() => {
    function update() {
      const w = window.innerWidth
      if (w >= 1024) setColumns(5)
      else if (w >= 768) setColumns(4)
      else if (w >= 640) setColumns(2)
      else setColumns(1)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return columns
}

export default function MenuPageView() {
  const { data, isPending, error } = useTableContext()
  const {
    data: menus,
    isPending: menusPending,
    error: menusError,
  } = useMenus(data?.organization.id)

  const columns = useColumns()
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop)
    }
  }, [menus])

  const rows: Row[] = useMemo(() => {
    if (!menus) return []
    const list: Row[] = []
    menus
      .filter((menu) => menu.items.length)
      .forEach((menu) => {
        list.push({ type: "header", menuId: String(menu.id), title: menu.menu })
        for (let i = 0; i < menu.items.length; i += columns) {
          list.push({
            type: "items",
            menuId: String(menu.id),
            items: menu.items.slice(i, i + columns),
          })
        }
      })
    return list
  }, [menus, columns])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (i) => (rows[i]?.type === "header" ? 40 : 230),
    overscan: 6,
    scrollMargin,
  })

  const virtualItems = virtualizer.getVirtualItems()

  const activeMenuId = useMemo(() => {
    if (!virtualItems.length) return null
    const threshold = virtualizer.scrollOffset ?? 0
    const measurements = virtualizer.measurementsCache
    let best: string | null = null
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].type !== "header") continue
      const start = measurements[i]?.start ?? 0
      if (start - scrollMargin <= threshold + STICKY_HEADER_HEIGHT + 10) {
        best = rows[i].menuId
      } else break
    }
    if (!best) best = rows.find((r) => r.type === "header")?.menuId ?? null
    return best
  }, [virtualItems, virtualizer, rows, scrollMargin])

  useEffect(() => {
    if (!activeMenuId) return
    const container = tabsContainerRef.current
    const button = buttonsRef.current.get(activeMenuId)
    if (!container || !button) return

    const containerRect = container.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()

    const isVisible =
      buttonRect.left >= containerRect.left &&
      buttonRect.right <= containerRect.right

    if (!isVisible) {
      const offset =
        buttonRect.left -
        containerRect.left -
        containerRect.width / 2 +
        buttonRect.width / 2

      container.scrollBy({ left: offset, behavior: "smooth" })
    }
  }, [activeMenuId])

  function scrollToMenu(menuId: string) {
    const rowIndex = rows.findIndex(
      (r) => r.type === "header" && r.menuId === menuId,
    )
    if (rowIndex === -1) return
    const measured = virtualizer.measurementsCache[rowIndex]
    const start = measured?.start ?? virtualizer.getOffsetForIndex(rowIndex, "start")?.[0] ?? 0
    const top = start + scrollMargin - STICKY_HEADER_HEIGHT
    window.scrollTo({ top, behavior: "smooth" })
  }

  if (isPending || menusPending) return <div>Loading...</div>
  if (menusError) return <div>Error: {menusError.message}</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-3 px-6 sticky top-0 bg-background z-20 py-4">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
        </InputGroup>
        <div
          ref={tabsContainerRef}
          className="flex gap-2 items-center overflow-x-scroll no-scrollbar"
        >
          {menus
            ?.filter((menu) => menu.items.length)
            .map((menu) => (
              <Button
                key={menu.id}
                ref={(el) => {
                  if (el) buttonsRef.current.set(String(menu.id), el)
                  else buttonsRef.current.delete(String(menu.id))
                }}
                className="rounded-full border-border!"
                variant={activeMenuId === String(menu.id) ? "default" : "outline"}
                onClick={() => scrollToMenu(String(menu.id))}
              >
                {menu.menu}
              </Button>
            ))}
        </div>
      </div>

      <div ref={listRef} className="px-6">
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index]
            if (!row) return null

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                }}
              >
                {row.type === "header" ? (
                  <h2 className="text-xs font-medium py-2">{row.title}</h2>
                ) : (
                  <div
                    className="grid gap-4 pb-4"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {row.items.map((item) => (
                      <div
                        key={item.id}
                        className="break-inside-avoid inline-block w-full"
                      >
                        <MenuCard item={item} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
