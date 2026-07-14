"use client"

import { useState } from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import { cn } from "@workspace/ui/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { formatCurrency } from "@workspace/shared/utils/formatter"
import { PrintReceiptButton } from "./print-receipt-button"

export const columns: ColumnDef<OrderResponse>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.getValue("invoiceNumber")}
      </span>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: () => <div className="text-right">Total Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("grandTotal") as number
      return (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: "gstRate",
    header: () => <div className="text-right">GST Rate</div>,
    cell: ({ row }) => {
      const amount = row.getValue("gstRate") as number
      return (
        <div className="text-right font-medium tabular-nums">{amount}%</div>
      )
    },
  },
  {
    accessorKey: "tableNumber",
    header: "Table",
    cell: ({ row }) => (
      <span className="font-semibold">{row.getValue("tableNumber")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | Date
      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      )
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string
      return (
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
            status === "paid" && "bg-emerald-500/15 text-emerald-600",
            status === "pending" && "bg-amber-500/15 text-amber-600",
            status === "failed" && "bg-red-500/15 text-red-600",
            status === "refunded" && "bg-blue-500/15 text-blue-600"
          )}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: "receipt",
    header: () => <div className="text-right">Receipt</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <PrintReceiptButton orderId={row.original.id} variant="secondary" />
      </div>
    ),
  },
]

interface ReceiptsDataTableProps {
  orders: OrderResponse[]
}

export default function ReceiptsDataTable({ orders }: ReceiptsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: { pageSize: 12 },
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No receipts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <IconChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
