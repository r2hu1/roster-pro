"use client"

import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar"

export default function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
  }) {
  const {open} = useSidebar();
  return (
    <div className="mb-6 gap-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {!open && <SidebarTrigger />}
        <SidebarTrigger className="md:hidden flex"/>
        <div className="grid gap-0">
          <h1 className="text-sm text-foreground/80 font-medium">{title}</h1>
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}
