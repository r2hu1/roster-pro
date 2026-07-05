import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "../../modules/sidebar/views/ui/sidebar"
import { SessionProvider } from "@/modules/providers/session-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}
