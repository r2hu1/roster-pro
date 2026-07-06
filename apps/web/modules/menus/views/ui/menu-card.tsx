"use client"
import Link from "next/link"
import type { MenuResponse } from "@workspace/shared/schemas/menu/response"
import { IconArrowUpRight, IconToolsKitchen2 } from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"

export default function MenuCard({ menu }: { menu: MenuResponse }) {
  return (
    <div className="[perspective:1000px] sm:max-w-52">
      <Link
        href={`/${menu.organizationId}/menus/${menu.id}`}
        className="bg-card group grid gap-2 overflow-hidden rounded-md border p-4 shadow-xs transition-transform duration-300 ease-out [transform-style:preserve-3d] hover:[transform:rotateX(6deg)_rotateY(-8deg)_translateY(-4px)] dark:shadow-none"
      >
        {/*<Badge variant="outline">Category</Badge>*/}
        <div className="flex items-center mb-4 justify-between gap-4 truncate transition-transform duration-300 [transform-style:preserve-3d] group-hover:[transform:translateZ(20px)]">
          <div className="group truncate">
            <h1 className="relative -mb-px truncate text-sm font-medium">
              <span className="inline-flex items-center gap-1">
                <IconArrowUpRight className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
                <span className="transition-[padding] duration-200 group-hover:pl-5">
                  {menu.name}
                </span>
              </span>
            </h1>
            <p className="text-muted-foreground truncate text-xs">
              {menu.description ? (
                menu.description
              ) : (
                <span className="text-muted-foreground text-xs italic">
                  No description added.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="relative h-34 -mr-28 -mb-20 ml-4 w-full -rotate-8 overflow-visible transition-transform duration-300 ease-out [transform-style:preserve-3d] group-hover:[transform:rotate(-8deg)_translateZ(40px)_translateY(-6px)]">
          <div
            className="bg-secondary text-secondary-foreground flex h-full w-full flex-col gap-1.5 rounded-t-sm p-3 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.45)] transition-shadow duration-300 group-hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.55)]"
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 90% 85%, 85% 100%, 80% 85%, 75% 100%, 70% 85%, 65% 100%, 60% 85%, 55% 100%, 50% 85%, 45% 100%, 40% 85%, 35% 100%, 30% 85%, 25% 100%, 20% 85%, 15% 100%, 10% 85%, 5% 100%, 0% 85%)",
            }}
          >
            <div className="flex items-center gap-1 border-b border-secondary-foreground/10 pb-1.5">
              <IconToolsKitchen2 className="size-3 shrink-0" />
              <span className="truncate text-[10px] font-semibold tracking-wide uppercase">
                Menu
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
              <span className="truncate">Fried Rice</span>
              <span className="text-secondary-foreground/70 shrink-0">
                ₹180
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
              <span className="truncate">Caesar Salad</span>
              <span className="text-secondary-foreground/70 shrink-0">₹9</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
              <span className="truncate">Truffle Pasta</span>
              <span className="text-secondary-foreground/70 shrink-0">₹22</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
