import { IconTable } from "@tabler/icons-react"

export function TableStats({
  total,
  occupied,
  available,
}: {
  total: number
  occupied: number
  available: number
}) {
  const stats = [
    { label: "Occupied", value: occupied },
    { label: "Available", value: available },
  ]

  return (
    <div className="flex flex-col md:flex-row bg-secondary rounded-xl overflow-hidden">
      <div className="rounded-xl w-full md:w-auto md:min-w-[220px] bg-linear-to-b from-primary to-chart-4 text-primary-foreground p-4 space-y-4 md:space-y-6">
        <p className="flex items-start gap-3 text-sm sm:text-base font-medium justify-between">
          Total Tables <IconTable className="size-6 shrink-0" />
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold">{total}</h1>
      </div>

      <div className="grid grid-cols-2 md:flex md:flex-1 divide-x-2 divide-border">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`w-full p-4 flex items-center justify-center px-4 sm:px-6 ${
              i >= 2 ? "border-t-2 md:border-t-0" : ""
            } ${i == 1 ? "md:border-r border-r-0" : ""} border-border`}
          >
            <p className="flex gap-2 sm:gap-4 text-base sm:text-lg font-medium items-center whitespace-nowrap">
              {stat.label} <span className="text-primary">{stat.value}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
