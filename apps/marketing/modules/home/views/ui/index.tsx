"use client"

import { useCallback } from "react"
import { Hero } from "./hero"
import { Stats } from "./stats"
import { Features } from "./features"
import { DashboardMockup } from "./dashboard-mockup"
import { Testimonials } from "./testimonials"
import { About } from "./about"
import { CTA } from "./cta"
import { Header } from "./header"

export default function LandingPage() {
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <DashboardMockup />
      <Testimonials />
      <About />
      <CTA />
    </div>
  )
}
