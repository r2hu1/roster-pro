import { SessionProvider } from "@/modules/providers/session-provider"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <main>{children}</main>
    </SessionProvider>
  )
}
