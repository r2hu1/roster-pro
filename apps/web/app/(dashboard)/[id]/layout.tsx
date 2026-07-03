import { SidebarInset, SidebarProvider, SidebarRail } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "../../../modules/sidebar/views/ui/sidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
