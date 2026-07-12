"use client"

import MenuCard from "@/modules/menu/views/ui/manu-card"

interface HeaderRow {
  type: "header"
  menuId: string
  title: string
}

interface ItemsRow {
  type: "items"
  menuId: string
  items: any[]
}

type Row = HeaderRow | ItemsRow

interface Props {
  row: Row
  columns: number
}

export default function MenuVirtualRow({ row, columns }: Props) {
  if (row.type === "header") {
    return <h2 className="text-xs font-medium py-3.5">{row.title}</h2>
  }

  return (
    <div
      className="grid gap-4 pb-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {row.items.map((item) => (
        <div key={item.id} className="break-inside-avoid inline-block w-full">
          <MenuCard item={item} />
        </div>
      ))}
    </div>
  )
}
