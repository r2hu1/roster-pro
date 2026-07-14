import { KitchenModeProvider } from "@/modules/providers/kitchen-mode"
import { ReactQueryProvider } from "@/modules/providers/query-client"
import { SessionProvider } from "@/modules/providers/session-provider"
import SubscriptionMiddleware from "@/modules/providers/subscription-middleware"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <SubscriptionMiddleware>
          <KitchenModeProvider>{children}</KitchenModeProvider>
        </SubscriptionMiddleware>
      </SessionProvider>
    </ReactQueryProvider>
  )
}
