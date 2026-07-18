import { ReactQueryProvider } from "@/modules/providers/query-client"
import { SessionProvider } from "@/modules/providers/session-provider"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
