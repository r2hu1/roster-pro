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
    <div className="grid grid-cols-2 md:flex bg-secondary rounded-xl overflow-hidden">
      <div className="col-span-2 rounded-xl w-full bg-linear-to-b from-primary to-chart-4 text-primary-foreground p-4 space-y-4 md:space-y-6">
        <p className="flex items-start gap-3 text-sm sm:text-base font-medium justify-between">
          Total Orders <IconReceiptRupee className="size-6 shrink-0" />
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold">{total}</h1>
      </div>

      <div className="bg-secondary w-full border-b-2 md:border-b-0 md:border-r-2 p-4 flex items-center justify-center px-4 sm:px-6">
        <p className="flex gap-2 sm:gap-4 text-base sm:text-lg font-medium items-center whitespace-nowrap">
          Pending <span className="text-primary">{pending}</span>
        </p>
      </div>

      <div className="bg-secondary w-full border-b-2 md:border-b-0 md:border-r-2 border-l-2 md:border-l-0 p-4 flex items-center justify-center px-4 sm:px-6">
        <p className="flex gap-2 sm:gap-4 text-base sm:text-lg font-medium items-center whitespace-nowrap">
          Completed <span className="text-primary">{completed}</span>
        </p>
      </div>

      <div className="bg-secondary w-full p-4 flex items-center justify-center px-4 sm:px-6">
        <p className="flex gap-2 sm:gap-4 text-base sm:text-lg font-medium items-center whitespace-nowrap">
          Cancelled <span className="text-primary">{cancelled}</span>
        </p>
      </div>
    </div>
  )
}
