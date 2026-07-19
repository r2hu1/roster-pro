import { SessionProvider } from "@/modules/providers/session-provider"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider enableOrganizations={false}>{children}</SessionProvider>
  )
}
