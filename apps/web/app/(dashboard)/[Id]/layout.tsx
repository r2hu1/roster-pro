"use client"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "../../../modules/sidebar/views/ui/sidebar"
import { useKitchenMode } from "@/modules/providers/kitchen-mode"
import KitchenModeToggle from "@/modules/sidebar/views/ui/kitchen-mode-toggle"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { kitchenMode } = useKitchenMode()

  return (
    <SidebarProvider>
      {!kitchenMode && <AppSidebar />}
      <SidebarInset className="p-6">
        <main className="max-w-6xl w-full mx-auto!">{children}</main>
      </SidebarInset>
      {kitchenMode && <KitchenModeToggle />}
    </SidebarProvider>
  )
}
