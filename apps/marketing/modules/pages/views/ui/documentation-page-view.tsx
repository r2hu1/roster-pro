"use client"

import { Button } from "@workspace/ui/components/button"
import {
  ArrowUpRight,
  Mail,
  UserCheck,
  Settings,
  HeadphonesIcon,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const setupSteps = [
  {
    icon: <UserCheck className="size-5" />,
    title: "Account creation",
    description:
      "Our onboarding team will create and configure your restaurant account with the correct plan, staff roles, and permissions tailored to your business.",
  },
  {
    icon: <Settings className="size-5" />,
    title: "Restaurant profile setup",
    description:
      "We populate your restaurant details — name, address, contact information, logo, operating hours, and tax configuration — so everything is ready from day one.",
  },
  {
    icon: <Mail className="size-5" />,
    title: "Menu configuration",
    description:
      "Your menu items, categories, modifiers, pricing, and GST/HST codes are added and organized. We also set up your QR codes for digital menu access.",
  },
  {
    icon: <HeadphonesIcon className="size-5" />,
    title: "Go-live support",
    description:
      "Once everything is configured, our team walks you through the platform, trains your staff, and ensures a smooth launch with ongoing support.",
  },
]

const faqs = [
  {
    q: "How long does the onboarding process take?",
    a: "Most restaurants are fully set up within 2–3 business days. The timeline depends on the complexity of your menu and the number of features you plan to use. Our team will keep you updated at every step.",
  },
  {
    q: "Do I need to install any hardware or software?",
    a: "No. RosterPro is entirely cloud-based. You just need a device with a browser and an internet connection. For kitchen display systems, we recommend a tablet or monitor — our team can advise on the best setup.",
  },
  {
    q: "Can I migrate my existing menu and customer data?",
    a: "Yes. Our onboarding team can import your existing menu, pricing, and customer information from most major POS systems or spreadsheets. Just share your current data with us and we will handle the rest.",
  },
  {
    q: "What training is provided for my staff?",
    a: "We provide a live training session for you and your team before going live. This covers order management, kitchen display operations, billing, and analytics. Recorded tutorials are also available 24/7.",
  },
  {
    q: "Is support available after onboarding?",
    a: "Absolutely. You get access to our support team via email and chat. Premium plans include priority support with faster response times and a dedicated account manager.",
  },
  {
    q: "Can I try RosterPro before committing?",
    a: "Yes. We offer a 7-day free trial with full access to all features. No credit card is required. Our onboarding team will set up a demo environment so you can explore the platform risk-free.",
  },
]

export default function DocumentationPageView() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <section className="px-6 pt-16 md:pt-24 pb-8 md:pb-12 border-b border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Documentation
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Everything you need to know about getting started with RosterPro.
            Our onboarding team handles the setup — you just focus on running
            your restaurant.
          </p>
        </div>
      </section>

      {/* Onboarding Process */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Setup handled by our team
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
              From account creation to go-live, your dedicated onboarding
              manager handles everything.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {setupSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-border/60 bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 py-16 md:py-24 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
              Quick answers to the most common questions about RosterPro.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium text-sm md:text-base pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === i ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Our onboarding team is ready to set everything up for you. Reach out
            and we will take it from here.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/contact">
                Contact us <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
