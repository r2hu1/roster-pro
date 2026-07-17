import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "sonner"
import { Realtime } from "@/components/realtime-provider"
import { NuqsAdapter } from "nuqs/adapters/next/app"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
        instrumentSans.variable
      )}
    >
      <body>
        <NuqsAdapter>
          <TooltipProvider>
            <Realtime>{children}</Realtime>
          </TooltipProvider>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  )
}
