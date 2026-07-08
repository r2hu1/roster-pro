import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export type TableStatus = "available" | "occupied"

const STATUS_LABEL: Record<TableStatus, string> = {
  available: "Available",
  occupied: "Occupied",
}

function TableGlyph({ label }: { label: string }) {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <span className="absolute top-0 h-2 w-4 rounded-full bg-orange-300/70" />
      <span className="absolute bottom-0 h-2 w-4 rounded-full bg-orange-300/70" />
      <span className="absolute left-0 h-4 w-2 rounded-full bg-orange-300/70" />
      <span className="absolute right-0 h-4 w-2 rounded-full bg-orange-300/70" />
      <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-orange-100">
        <span className="text-[10px] font-semibold text-neutral-800">
          {label}
        </span>
      </div>
    </div>
  )
}

export function TableCard({
  number,
  name,
  status = "available",
  onClick,
  className,
}: {
  number: string
  name?: string
  status?: TableStatus
  onClick?: () => void
  className?: string
}) {
  const isAvailable = status === "available"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <TableGlyph label={number} />
        {name && (
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {name}
          </span>
        )}
      </div>

      <Badge variant="secondary">{STATUS_LABEL[status]}</Badge>
    </button>
  )
}
