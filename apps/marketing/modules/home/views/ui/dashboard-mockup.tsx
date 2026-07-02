import { sidebarItems, orders, statusColor } from "./dashboard-data"

export function DashboardMockup() {
  return (
    <section className="px-5 pb-18 md:pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="group overflow-hidden rounded-xl border border-border/60 bg-background shadow-lg transition-all duration-500 hover:shadow-xl">
          <div className="flex h-8 items-center gap-1.5 border-border/60 border-b bg-muted/40 px-4">
            <span className="size-2 rounded-full bg-red-400/80" />
            <span className="size-2 rounded-full bg-yellow-400/80" />
            <span className="size-2 rounded-full bg-green-400/80" />
            <span className="ml-2.5 text-[11px] font-medium text-muted-foreground/60">
              rosterpro.com/dashboard
            </span>
          </div>
          <div className="grid md:grid-cols-5">
            <div className="hidden border-border/60 border-r bg-muted/15 p-3 md:block">
              {sidebarItems.map((item, i) => (
                <div
                  key={item}
                  className={`mb-0.5 rounded-lg px-3 py-1.5 text-xs ${i === 0 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="col-span-4 space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Today&apos;s Orders</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Apr 14, 2026
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    47 orders
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary" />
                    $3,240 revenue
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-border/50 bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">Revenue</p>
                  <p className="mt-0.5 text-lg font-bold">$3,240</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">Orders</p>
                  <p className="mt-0.5 text-lg font-bold">47</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Avg. Check
                  </p>
                  <p className="mt-0.5 text-lg font-bold">$68</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold">{order.id}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {order.table}
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {order.items}
                      </span>
                      <span className="text-[11px] text-muted-foreground sm:hidden">
                        {order.items.slice(0, 15)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[order.status]}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60">
                        {order.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-6 text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" />
            Kitchen Dashboard
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            Customer App
          </span>
        </div>
      </div>
    </section>
  )
}
