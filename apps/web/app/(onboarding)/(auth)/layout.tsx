import { SessionProvider } from "@/modules/providers/session-provider"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
