import { KitchenModeProvider } from "@/modules/providers/kitchen-mode"
import { ReactQueryProvider } from "@/modules/providers/query-client"
import { SessionProvider } from "@/modules/providers/session-provider"
import SubscriptionMiddleware from "@/modules/providers/subscription-middleware"
import DashboardShell from "@/components/dashboard-shell"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <SubscriptionMiddleware>
        <KitchenModeProvider>
          <DashboardShell>{children}</DashboardShell>
        </KitchenModeProvider>
      </SubscriptionMiddleware>
    </SessionProvider>
  )
}
