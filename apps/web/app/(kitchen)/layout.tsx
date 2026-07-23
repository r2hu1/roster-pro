import { SessionProvider } from "@/modules/providers/session-provider"
import SubscriptionMiddleware from "@/modules/providers/subscription-middleware"

export default function KitchenLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <SubscriptionMiddleware>{children}</SubscriptionMiddleware>
    </SessionProvider>
  )
}
