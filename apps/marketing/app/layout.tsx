import type { Metadata } from "next"
import { Geist_Mono, Instrument_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import { Footer } from "@/modules/home/views/ui/footer"

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "RosterPro",
  description: "The operating system for modern restaurants",
  icons: {
    icon: "/assets/roster-pro-logo.jpeg",
    shortcut: "/assets/roster-pro-logo.jpeg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
}
