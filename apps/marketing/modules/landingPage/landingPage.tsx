import Image from "next/image"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

const features = [
  {
    title: "Kitchen Display",
    description:
      "Orders routed to stations in real time with timers, modifiers, and drag-and-drop priority.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
  },
  {
    title: "Online Ordering",
    description:
      "Your own branded ordering site and mobile app with live tracking, tips, and contactless pay.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <line x1="3" x2="21" y1="6" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    title: "Table Manager",
    description:
      "Visual floor plan with drag-and-drop seating, waitlist, reservations, and turn-time tracking.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Live Analytics",
    description:
      "Sales trends, peak hours, popular items, and labor costs — all updated in real time.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Inventory Control",
    description:
      "Auto-track stock across suppliers, get low-inventory alerts, and generate purchase orders.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    title: "Team Management",
    description:
      "Staff scheduling, clock-in/out, role-based access, and team messaging in one place.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
]

const sidebarItems = ["Dashboard", "Orders", "Menu", "Reports", "Settings"]

const orders = [
  { id: "#1042", table: "T5", items: "2x Cheeseburger, 1x Fries", status: "Preparing", time: "2m ago" },
  { id: "#1041", table: "T3", items: "1x Pasta, 2x House Salad", status: "Ready", time: "5m ago" },
  { id: "#1040", table: "T8", items: "3x Margherita Pizza", status: "Served", time: "12m ago" },
  { id: "#1039", table: "T2", items: "1x Ribeye, 1x Mash", status: "Preparing", time: "1m ago" },
]

const statusColor: Record<string, string> = {
  Preparing: "bg-amber-500/15 text-amber-600",
  Ready: "bg-green-500/15 text-green-600",
  Served: "bg-muted-foreground/15 text-muted-foreground",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      {/* Navbar */}
      <header className="fixed top-4 left-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-border/40 bg-background/80 shadow-xs backdrop-blur-xl md:w-[65vw]">
        <div className="flex h-14 items-center justify-between px-5 md:h-14 md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="RosterPro"
              width={130}
              height={39}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
              <Button size="sm" className="text-sm">
                Get Started
              </Button>
            </div>
          </nav>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg md:hidden"
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-3xl" />
          <div className="absolute right-0 bottom-0 size-[300px] rounded-full bg-gradient-to-t from-chart-2/8 to-transparent blur-3xl" />
          <div className="absolute top-1/3 left-0 size-[250px] rounded-full bg-gradient-to-r from-chart-4/5 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3.5 py-1 font-medium text-muted-foreground text-xs backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-primary" />
            Now in Public Beta
          </div>  
          <h1 className="max-w-4xl font-bold text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            The operating system{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              for modern restaurants
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
            Connect your kitchen display, online ordering, table management, and
            analytics in one place. Stop juggling six tools — start running a
            smoother restaurant.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-7 text-sm">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="h-11 px-7 text-sm">
              Watch the Demo
            </Button>
          </div>
          <p className="mt-3 text-muted-foreground text-xs">
            No credit card &middot; Free 14-day trial &middot; Onboarding
            included
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative z-10 mt-16 w-full max-w-4xl md:mt-20">
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
                    <p className="text-[11px] text-muted-foreground">Apr 14, 2026</p>
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
                    <p className="text-[11px] text-muted-foreground">Avg. Check</p>
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
                        <span className="text-[11px] text-muted-foreground">{order.table}</span>
                        <span className="hidden text-xs text-muted-foreground sm:block">{order.items}</span>
                        <span className="text-[11px] text-muted-foreground sm:hidden">{order.items.slice(0, 15)}...</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60">{order.time}</span>
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

      {/* Stats */}
      <section className="border-border border-t bg-background/60 px-5 py-14 md:py-18">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Active restaurants", value: "500+" },
              { label: "Orders processed", value: "2.4M" },
              { label: "Avg. ticket time", value: "4.7m" },
              { label: "Avg. rating", value: "4.9" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 py-18 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
              One platform. Every tool you need.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Front-of-house, back-of-house, and everything in between —
              designed to work together seamlessly.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border border-t bg-background/60 px-5 py-18 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
            Ready to simplify your operation?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Join hundreds of restaurants using RosterPro to cut wait times,
            reduce errors, and grow revenue.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-11 px-7 text-sm">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="h-11 px-7 text-sm">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t bg-background/40 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RosterPro"
              width={100}
              height={30}
              className="h-7 w-auto"
            />
            <span className="text-muted-foreground text-xs">
              &copy; 2026 RosterPro
            </span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-muted-foreground text-xs transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
