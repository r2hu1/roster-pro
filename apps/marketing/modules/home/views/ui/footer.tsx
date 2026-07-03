"use client"
import { Button } from "@workspace/ui/components/button"
import React from "react"
import { Logo } from "./logo"

const footerLinks = [
  {
    title: "Product",
    links: ["Overview", "Pricing", "Integrations", "Documentation"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Brand", "Press"],
  },
  {
    title: "Resources",
    links: ["Blog", "Newsletter", "Support", "Guides"],
  },
  {
    title: "Social",
    links: ["Twitter", "GitHub", "LinkedIn", "YouTube"],
  },
]

export const Footer = () => {
  return (
    <footer className="w-full border-t mt-18">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1 space-y-3">
            <Logo className="-ml-2" />
            <p className="text-sm text-pretty leading-relaxed mb-6">
              Building the next generation of restaurant.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex gap-4">
            <span className="text-xs">© 2026 Platform Inc.</span>
            <a href="/terms" className="text-xs hover:text-white">
              Terms & Condition
            </a>
            <a href="/privacy-policy" className="text-xs hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
