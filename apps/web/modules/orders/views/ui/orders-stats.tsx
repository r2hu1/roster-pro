import { IconReceiptRupee } from "@tabler/icons-react"

export function OrdersStats({
  total,
  pending,
  completed,
  cancelled,
}: {
  total: number
  pending: number
  completed: number
  cancelled: number
}) {
  return (
    <div className="flex bg-secondary rounded-xl overflow-hidden">
      <div className="rounded-xl w-full bg-linear-to-b from-primary to-chart-4 text-primary-foreground p-4 space-y-6">
        <p className="flex items-start gap-3 text-base font-medium justify-between">
          Total Orders <IconReceiptRupee className="size-6" />
        </p>
        <h1 className="text-3xl font-bold">{total}</h1>
      </div>
      <div className="bg-secondary w-full border-r-2 p-4 flex items-center justify-center px-6">
        <p className="flex gap-4 text-lg font-medium items-center">
          Pending <span className="text-primary">{pending}</span>
        </p>
      </div>
      <div className="bg-secondary w-full border-r-2 p-4 flex items-center justify-center px-6">
        <p className="flex gap-4 text-lg font-medium items-center">
          Completed <span className="text-primary">{completed}</span>
        </p>
      </div>
      <div className="bg-secondary w-full p-4 flex items-center justify-center px-6">
        <p className="flex gap-4 text-lg font-medium items-center">
          Cancelled <span className="text-primary">{cancelled}</span>
        </p>
      </div>
    </div>
  )
}
