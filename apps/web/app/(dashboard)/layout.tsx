import { KitchenModeProvider } from "@/modules/providers/kitchen-mode"
import { ReactQueryProvider } from "@/modules/providers/query-client"
import { SessionProvider } from "@/modules/providers/session-provider"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <KitchenModeProvider>
          {children}
        </KitchenModeProvider>
      </SessionProvider>
    </ReactQueryProvider>
  )
}
