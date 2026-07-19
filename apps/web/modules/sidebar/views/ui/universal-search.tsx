"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import {
  Armchair2,
  BillList,
  ChartBarTrendUp,
  ChefHat,
  Cart,
  CreditCard,
  Home,
  Settings,
  ShoppingCart,
  Sidebar,
} from "reicon-react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { useSession } from "@/modules/providers/session-provider"
import { useSidebar } from "@workspace/ui/components/sidebar"
import api from "@/lib/axios"

type Table = {
  id: string
  number: number
  name: string | null
  status: string
}

type MenuItem = {
  id: string
  name: string
  description: string | null
  menuId: string
  price: { half: number; full: number }
}

type MenuWithItems = {
  id: string
  menu: string
  items: MenuItem[]
}

type Order = {
  id: string
  invoiceNumber: string
  tableNumber: string
  customerName: string | null
  status: string
  grandTotal: string
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function UniversalSearch({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { organization } = useSession()
  const { toggleSidebar } = useSidebar()
  const orgId = organization?.id
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query, 300)

  const { data: tables, isFetching: tablesLoading } = useQuery({
    queryKey: ["search-tables", orgId],
    queryFn: async () => {
      const res = await api.get<{
        status: string
        code: number
        data: Table[]
      }>("/organization/table")
      return res.data.data ?? []
    },
    enabled: open && !!orgId,
    staleTime: 60_000,
  })

  const { data: menus, isFetching: menusLoading } = useQuery({
    queryKey: ["search-menus", orgId],
    queryFn: async () => {
      const res = await api.get<{
        status: string
        code: number
        data: MenuWithItems[]
      }>(`/organization/menu/all/${orgId}`)
      return res.data.data ?? []
    },
    enabled: open && !!orgId,
    staleTime: 60_000,
  })

  const {
    data: orders,
    isFetching: ordersLoading,
    isPlaceholderData: ordersStale,
  } = useQuery<Order[]>({
    queryKey: ["search-orders", orgId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return []
      const res = await api.get<{
        status: string
        code: number
        data: { data: Order[]; nextCursor: string | null; hasMore: boolean }
      }>("/organization/orders", {
        params: { search: debouncedQuery, limit: 8 },
      })
      return res.data.data?.data ?? []
    },
    enabled: open && !!orgId && !!debouncedQuery,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })

  const hasQuery = debouncedQuery.length > 0

  const filteredTables = React.useMemo(() => {
    if (!tables) return []
    if (!hasQuery) return tables.slice(0, 5)
    const q = debouncedQuery.toLowerCase()
    return tables
      .filter(
        (t) => String(t.number).includes(q) || t.name?.toLowerCase().includes(q)
      )
      .slice(0, 5)
  }, [tables, debouncedQuery, hasQuery])

  const filteredItems = React.useMemo(() => {
    if (!menus) return []
    if (!hasQuery) return []
    const q = debouncedQuery.toLowerCase()
    const results: { item: MenuItem; menuName: string }[] = []
    for (const menu of menus) {
      for (const item of menu.items) {
        if (
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        ) {
          results.push({ item, menuName: menu.menu })
          if (results.length >= 5) break
        }
      }
      if (results.length >= 5) break
    }
    return results
  }, [menus, debouncedQuery, hasQuery])

  const loading =
    (hasQuery && ordersLoading && !ordersStale) || tablesLoading || menusLoading

  function navigate(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setOpen(true)}>{children}</button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search orders, tables, menu items..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader className="size-4" />
                Searching...
              </div>
            )}

            {!loading &&
              hasQuery &&
              !orders?.length &&
              !filteredTables.length &&
              !filteredItems.length && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}


            {hasQuery && orders && orders.length > 0 && (
              <CommandGroup heading={`Orders (${orders.length})`}>
                {orders.map((order) => (
                  <CommandItem key={order.id} onSelect={() => navigate("/")}>
                    <Cart className="size-4" />
                    <div className="flex flex-1 items-center justify-between">
                      <span>{order.invoiceNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        Table {order.tableNumber} · ₹{order.grandTotal}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasQuery && filteredTables.length > 0 && (
              <CommandGroup heading="Tables">
                {filteredTables.map((table) => (
                  <CommandItem
                    key={table.id}
                    onSelect={() => navigate(`/${orgId}/tables`)}
                  >
                    <Armchair2 className="size-4" />
                    <div className="flex flex-1 items-center justify-between">
                      <span>
                        Table {table.number}
                        {table.name ? ` (${table.name})` : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {table.status}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasQuery && filteredItems.length > 0 && (
              <CommandGroup heading="Menu Items">
                {filteredItems.map(({ item, menuName }) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => navigate(`/${orgId}/menus`)}
                  >
                    <ChefHat className="size-4" />
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {menuName}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ₹{item.price.half} / ₹{item.price.full}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

                <CommandGroup heading="Navigate to">
                  <CommandItem onSelect={() => navigate(`/${orgId}`)}>
                    <Cart className="size-4" />
                    <span>Orders</span>
                  </CommandItem>
                  <CommandItem onSelect={() => navigate(`/${orgId}/tables`)}>
                    <Armchair2 className="size-4" />
                    <span>Tables</span>
                  </CommandItem>
                  <CommandItem onSelect={() => navigate(`/${orgId}/menus`)}>
                    <ChefHat className="size-4" />
                    <span>Menus</span>
                  </CommandItem>
                  <CommandItem onSelect={() => navigate(`/${orgId}/analytics`)}>
                    <ChartBarTrendUp className="size-4" />
                    <span>Analytics</span>
                  </CommandItem>
                  <CommandItem onSelect={() => navigate(`/${orgId}/receipts`)}>
                    <BillList className="size-4" />
                    <span>Receipts</span>
                  </CommandItem>
                </CommandGroup>

                <CommandGroup heading="Settings">
                  <CommandItem
                    onSelect={() => navigate(`/${orgId}/settings?tab=general`)}
                  >
                    <Home className="size-4" />
                    <span>General</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => navigate(`/${orgId}/settings?tab=billing`)}
                  >
                    <ShoppingCart className="size-4" />
                    <span>Billing</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      navigate(`/${orgId}/settings?tab=subscription`)
                    }
                  >
                    <CreditCard className="size-4" />
                    <span>Subscription</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      toggleSidebar()
                    }}
                  >
                    <Sidebar className="size-4" />
                    <span>Toggle Sidebar</span>
                  </CommandItem>
                </CommandGroup>

          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
