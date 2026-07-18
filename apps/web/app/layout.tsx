import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "sonner"
import { Realtime } from "@/components/realtime-provider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ReactQueryProvider } from "@/modules/providers/query-client"

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
        <ReactQueryProvider>
          <NuqsAdapter>
            <TooltipProvider>
              <Realtime>{children}</Realtime>
            </TooltipProvider>
            <Toaster
              position="top-center"
              className="toaster group z-9999!"
              toastOptions={{
                classNames: {
                  toast:
                    "p-3! rounded-xl! px-4! group toast group-[.toaster]:bg-foreground! group-[.toaster]:text-background! group-[.toaster]:border-0! group-[.toaster]:shadow-lg",
                  description: "group-[.toast]:text-muted-foreground",
                  actionButton:
                    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                  cancelButton:
                    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                  icon: "size-4! mr-2!",
                },
              }}
              duration={2000}
            />
          </NuqsAdapter>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
