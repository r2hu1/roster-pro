import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import ReactQueryProvider from "@/modules/providers/react-query-provider"
import { Toaster } from "sonner"
import { ContextProvider } from "@/modules/providers/context-provider"

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
        "antialiased ",
        fontMono.variable,
        "font-sans",
        instrumentSans.variable
      )}
    >
      <body>
        <ReactQueryProvider>
          <ContextProvider>{children}</ContextProvider>
        </ReactQueryProvider>
        <Toaster
          toastOptions={{
            classNames: {
              cancelButton:
                "rounded-full! bg-transparent! text-muted-foreground! text-xl! hover:bg-red-600 px-2",
            },
          }}
        />
      </body>
    </html>
  )
}
