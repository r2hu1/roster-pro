export const sidebarItems = [
  "Dashboard",
  "Orders",
  "Menu",
  "Reports",
  "Settings",
]

export const orders = [
  {
    id: "#1042",
    table: "T5",
    items: "2x Cheeseburger, 1x Fries",
    status: "Preparing",
    time: "2m ago",
  },
  {
    id: "#1041",
    table: "T3",
    items: "1x Pasta, 2x House Salad",
    status: "Ready",
    time: "5m ago",
  },
  {
    id: "#1040",
    table: "T8",
    items: "3x Margherita Pizza",
    status: "Served",
    time: "12m ago",
  },
  {
    id: "#1039",
    table: "T2",
    items: "1x Ribeye, 1x Mash",
    status: "Preparing",
    time: "1m ago",
  },
]

export const statusColor: Record<string, string> = {
  Preparing: "bg-amber-500/15 text-amber-600",
  Ready: "bg-green-500/15 text-green-600",
  Served: "bg-muted-foreground/15 text-muted-foreground",
}
