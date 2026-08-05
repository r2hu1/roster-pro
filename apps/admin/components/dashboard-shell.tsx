"use client"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/modules/sidebar/views/ui/sidebar"

export default function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-6">
        <main className="max-w-6xl w-full mx-auto!">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
