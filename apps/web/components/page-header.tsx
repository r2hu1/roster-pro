"use client"

import { SidebarTrigger } from "@workspace/ui/components/sidebar"

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
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="grid gap-0">
          <h1 className="text-sm text-foreground/80 font-medium">{title}</h1>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}
