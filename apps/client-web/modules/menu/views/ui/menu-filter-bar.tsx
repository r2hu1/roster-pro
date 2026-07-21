"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { CartShopping, Grid, List3, Search } from "reicon-react"
import { useCart } from "@/modules/cart/views/provider/cart-provider"
import CartSheet from "@/modules/cart/views/ui/cart-sheet"
import { useViewType } from "../providers/view-type"

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
  const { totalItems } = useCart()

  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry?.isIntersecting)
      },
      { threshold: 1 }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="h-px" />

      <div className="sticky top-0 z-20 space-y-3 bg-background px-6 py-4">
        <div className="flex items-center">
          <AnimatePresence initial={false}>
            {isSticky && (
              <motion.div
                key="cart"
                initial={{
                  width: 0,
                  opacity: 0,
                  marginRight: 0,
                  x: -10,
                }}
                animate={{
                  width: 37,
                  opacity: 1,
                  marginRight: 8,
                  x: 0,
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                  marginRight: 0,
                  x: -10,
                }}
                transition={{
                  duration: 0.22,
                  ease: "easeOut",
                }}
                className="shrink-0"
              >
                <CartSheet>
                  <Button size="icon-lg" className="relative">
                    <CartShopping className="size-4" />

                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[11px]">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </CartSheet>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="flex-1">
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
          </motion.div>

          <div className="ml-2">
            <Button
              size="icon-lg"
              type="button"
              onClick={() => setViewType(viewType === "list" ? "grid" : "list")}
            >
              {viewType === "list" ? <Grid /> : <List3 />}
            </Button>
          </div>
        </div>

        <div
          ref={tabsContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar"
        >
          {menus
            .filter((menu) => menu.items.length)
            .map((menu) => (
              <Button
                key={menu.id}
                ref={(el) => {
                  if (el) {
                    buttonsRef.current.set(menu.id, el)
                  } else {
                    buttonsRef.current.delete(menu.id)
                  }
                }}
                className="rounded-full border-border!"
                variant={activeMenuId === menu.id ? "default" : "outline"}
                onClick={() => onMenuClick(menu.id)}
              >
                {menu.menu}
              </Button>
            ))}
        </div>
      </div>
    </>
  )
}
