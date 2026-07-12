"use client"

import Glow from "@workspace/ui/components/glow"
import { Button } from "@workspace/ui/components/button"
import { ArrowUpRight, Target, Eye, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const values = [
  {
    icon: <Target className="size-5" />,
    title: "Our Mission",
    description:
      "To empower every restaurant with technology that simplifies operations, reduces costs, and creates memorable dining experiences for their guests.",
  },
  {
    icon: <Eye className="size-5" />,
    title: "Our Vision",
    description:
      "A world where every restaurant — from a family-owned eatery to a multi-location chain — runs on a single, intelligent platform.",
  },
  {
    icon: <Heart className="size-5" />,
    title: "Our Promise",
    description:
      "We build tools we'd use ourselves. Every feature is designed with real restaurant workflows in mind, not theoretical assumptions.",
  },
]

const teamStats = [
  { label: "Founded", value: "2026" },
  { label: "Team Members", value: "7" },
  { label: "Restaurants Served", value: "500+" },
  { label: "Support", value: "24/7" },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="overflow-hidden px-6">
        <div className="relative mx-auto max-w-5xl w-full py-16 md:py-28 lg:py-24">
          <Glow variant="top" className="-z-10" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              Know more about the{" "}
              <span className="relative inline-block border-2 border-primary px-4 py-1 bg-primary/10 text-primary rounded-md">
                RosterPro & Background
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary" />
              </span>
            </h1>
            <p className="mx-auto my-8 text-muted-foreground max-w-2xl text-xl">
              RosterPro was built by restaurant people, for restaurant people.
              We experienced the chaos of juggling multiple tools firsthand —
              and decided to build one platform that does it all.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Built from real kitchen experience
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                RosterPro was born in the back of a busy restaurant. Our
                founders spent years managing front-of-house and back-of-house
                operations, struggling with disconnected systems that made
                simple tasks unnecessarily complex.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built RosterPro to connect every part of a restaurant — from
                the QR code on the table to the kitchen display, from the
                billing counter to the analytics dashboard. One platform. One
                source of truth.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-border/60">
              <Image
                src="/assets/analytics.jpeg"
                alt="RosterPro team at work"
                width={1200}
                height={900}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              What drives us
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
              Every decision we make is guided by these core principles.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border/60 bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {teamStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-card p-5 text-center"
              >
                <p className="font-bold text-2xl text-primary md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-muted-foreground text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-18 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to transform your restaurant?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Join hundreds of restaurants already using RosterPro to streamline
            operations and grow revenue.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="https://cal.com/roster-pro/product-demo-possible-partnership">
                Get Started <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
