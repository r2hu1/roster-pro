import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "../../../modules/sidebar/views/ui/sidebar"
import { SessionProvider } from "@/modules/providers/session-provider"
import { ReactQueryProvider } from "@/modules/providers/query-client"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </SessionProvider>
    </ReactQueryProvider>
  )
}
