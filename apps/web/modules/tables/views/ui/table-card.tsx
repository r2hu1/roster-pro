import { IconPencil } from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import TableQrCodeModal from "./table-qr-code"

export type TableStatus = "available" | "occupied"

const STATUS_LABEL: Record<TableStatus, string> = {
  available: "Available",
  occupied: "Occupied",
}

function TableGlyph({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex h-12 w-12 shrink-0 items-center justify-center",
        className
      )}
    >
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
  tableId,
  className,
}: {
  number: string
  name?: string
  status?: TableStatus
  onClick?: () => void
  tableId?: string
  className?: string
}) {
  const isAvailable = status === "available"

  return (
    <div className="group">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex flex-col group/btn hover:shadow-sm group-hover:rounded-b-none w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <TableGlyph
            label={number}
            className="group-hover/btn:opacity-0 group-hover/btn:h-0"
          />
          <div className="group-hover/btn:opacity-100 opacity-0 size-0 flex items-center justify-center group-hover/btn:size-11 rounded-lg bg-secondary">
            <IconPencil className="size-5" />
          </div>
          {name && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {name}
            </span>
          )}
        </div>

        <Badge variant={!isAvailable ? "secondary" : "default"}>
          {STATUS_LABEL[status]}
        </Badge>
      </button>
      <div className="h-0 p-0 justify-center overflow-hidden group-hover:p-4 group-hover:h-4 flex items-center rounded-b-xl group-hover:border-b group-hover:border-l group-hover:border-r transition-all bg-sidebar">
        <TableQrCodeModal table={{ id: tableId!, number: Number(number) }}>
          <span className="text-xs cursor-pointer hover:underline">
            View Qr Code
          </span>
        </TableQrCodeModal>
      </div>
    </div>
  )
}
