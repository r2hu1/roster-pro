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
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-sm text-foreground/80 font-medium">{title}</h1>
        </div>
        <p>{description}</p>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}
