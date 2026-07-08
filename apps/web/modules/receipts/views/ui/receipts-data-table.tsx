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
import type { OrderResponse, InvoiceData } from "@workspace/shared/schemas/order/index"
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
import { IconPrinter, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useSession } from "@/modules/providers/session-provider"
import { generateInvoice } from "@/modules/orders/api/orders"
import { formatCurrency } from "@workspace/shared/utils/formatter"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function PrintReceiptButton({ order }: { order: OrderResponse }) {
  const { organization } = useSession()
  const [printing, setPrinting] = useState(false)

  const handlePrint = async () => {
    if (!organization?.id) return

    setPrinting(true)

    try {
      const invoice = (await generateInvoice(
        order.id,
        organization.id
      )) as InvoiceData

      const printWindow = window.open("", "_blank", "width=420,height=900")
      if (!printWindow) return

      const esc = escapeHtml

      const fmt = (value: number) => formatCurrency(value)

      const date = new Date(invoice.issuedAt)

      const issuedDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })

      const issuedTime = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

      const gstHalf = invoice.totals.gstRate / 2

      printWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8" />
  <title>${esc(invoice.invoiceNumber)}</title>

  <style>
  @page{
    size:80mm auto;
    margin:0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%;
    font-family: 'Courier New', 'Consolas', monospace;
    color: #000;
    font-size: 12px;
    line-height: 1.4;
  }
  .receipt{
    width:80mm;
    padding:5mm;
    margin: 0 auto;
  }

  .center{
    text-align:center;
  }

  .right{
    text-align:right;
  }

  .bold{
    font-weight:bold;
  }

  .small{
    font-size:10px;
  }

  .big{
    font-size:17px;
    font-weight:bold;
    text-transform:uppercase;
  }

  hr{
    border:none;
    border-top:1px dashed #000;
    margin:8px 0;
  }

  .row{
    display:flex;
    justify-content:space-between;
    gap:10px;
    margin:2px 0;
  }

  table{
    width:100%;
    border-collapse:collapse;
  }

  thead th{
    text-align:left;
    padding:4px 0;
    border-bottom:1px dashed #000;
  }

  th:last-child,
  td:last-child{
    text-align:right;
  }

  td{
    padding:4px 0;
    vertical-align:top;
  }

  .qty,
  .rate,
  .amount{
    text-align:right;
    white-space:nowrap;
  }

  .total-row{
    display:flex;
    justify-content:space-between;
    margin:3px 0;
  }

  .grand{
    font-size:15px;
    font-weight:bold;
    border-top:1px dashed #000;
    padding-top:6px;
    margin-top:6px;
  }

  .footer{
    text-align:center;
    margin-top:10px;
  }

  @media print{
    body{
      print-color-adjust:exact;
      -webkit-print-color-adjust:exact;
    }
  }
  </style>

  </head>

  <body>

  <div class="receipt">

  <div class="center">
    <div class="big">${esc(invoice.organization.name)}</div>

    ${
      invoice.organization.address
        ? `<div>${esc(invoice.organization.address)}</div>`
        : ""
    }

    ${
      invoice.organization.phone
        ? `<div>Phone : ${esc(invoice.organization.phone)}</div>`
        : ""
    }

    ${
      invoice.organization.gstin
        ? `<div>GSTIN : ${esc(invoice.organization.gstin)}</div>`
        : ""
    }

    ${
      invoice.organization.hsnSac
        ? `<div>HSN/SAC : ${invoice.organization.hsnSac}</div>`
        : ""
    }
  </div>

  <hr>

  <div class="row">
    <span>Receipt No.</span>
    <span class="bold">${esc(invoice.invoiceNumber)}</span>
  </div>

  <div class="row">
    <span>Date</span>
    <span>${issuedDate}</span>
  </div>

  <div class="row">
    <span>Time</span>
    <span>${issuedTime}</span>
  </div>

  <div class="row">
    <span>Table</span>
    <span>${esc(invoice.customer.tableNumber)}</span>
  </div>

  <div class="row">
    <span>Customer</span>
    <span>${esc(invoice.customer.name || "Guest")}</span>
  </div>

  <hr>

  <table>

  <thead>
  <tr>
  <th style="width:48%">Item</th>
  <th class="qty">Qty</th>
  <th class="rate">Rate</th>
  <th class="amount">Amt</th>
  </tr>
  </thead>

  <tbody>

  ${invoice.items
    .map(
      (item) => `
  <tr>
  <td>${esc(item.name)}</td>
  <td class="qty">${item.quantity}</td>
  <td class="rate">${fmt(item.unitPrice)}</td>
  <td class="amount">${fmt(item.total)}</td>
  </tr>
  `
    )
    .join("")}</tbody>

    </table>

    <hr>

    <div class="total-row">
      <span>Subtotal</span>
      <span>${fmt(invoice.totals.subtotal)}</span>
    </div>

    ${
      invoice.totals.discount > 0
        ? `
    <div class="total-row">
      <span>Discount</span>
      <span>- ${fmt(invoice.totals.discount)}</span>
    </div>
    `
        : ""
    }

    ${
      invoice.totals.taxableAmount !== invoice.totals.subtotal ||
      invoice.totals.discount > 0
        ? `
    <div class="total-row">
      <span>Taxable Amount</span>
      <span>${fmt(invoice.totals.taxableAmount)}</span>
    </div>
    `
        : ""
    }

    ${
      invoice.totals.cgst > 0
        ? `
    <div class="total-row">
      <span>CGST (${gstHalf}%)</span>
      <span>${fmt(invoice.totals.cgst)}</span>
    </div>
    `
        : ""
    }

    ${
      invoice.totals.sgst > 0
        ? `
    <div class="total-row">
      <span>SGST (${gstHalf}%)</span>
      <span>${fmt(invoice.totals.sgst)}</span>
    </div>
    `
        : ""
    }

    ${
      invoice.totals.igst > 0
        ? `
    <div class="total-row">
      <span>IGST (${invoice.totals.gstRate}%)</span>
      <span>${fmt(invoice.totals.igst)}</span>
    </div>
    `
        : ""
    }

    ${
      invoice.totals.roundOff !== 0
        ? `
    <div class="total-row">
      <span>Round Off</span>
      <span>${fmt(invoice.totals.roundOff)}</span>
    </div>
    `
        : ""
    }

    <div class="total-row grand">
      <span>Grand Total</span>
      <span>${fmt(invoice.totals.grandTotal)}</span>
    </div>

    <hr>

    <div class="row">
      <span>Payment Status</span>
      <span style="text-transform:capitalize">
        ${esc(invoice.payment.status)}
      </span>
    </div>

    ${
      invoice.payment.method
        ? `
    <div class="row">
      <span>Payment Method</span>
      <span style="text-transform:capitalize">
        ${esc(invoice.payment.method)}
      </span>
    </div>
    `
        : ""
    }

    ${
      invoice.notes
        ? `
    <hr>

    <div class="small">
    <strong>Notes</strong><br/>
    ${esc(invoice.notes)}
    </div>
    `
        : ""
    }

    <hr>

    <div class="footer">

    <div class="bold">
    THANK YOU! VISIT AGAIN
    </div>

    <br/>

    <div>
    This is a computer generated receipt.
    </div>

    ${
      invoice.organization.gstin
        ? `
    <div>
    GST Included As Applicable.
    </div>
    `
        : ""
    }

    <br/>

    <div class="small">
    Powered by Roster Pro
    </div>

    </div></div>

    <script>
    window.onload = () => {
      window.focus();
      window.print();

      window.onafterprint = () => {
        window.close();
      };
    };
    </script>

    </body>
    </html>
    `)

      printWindow.document.close()
    } catch (error) {
      console.error("Failed to print receipt:", error)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePrint}
      disabled={!organization?.id || printing}
    >
      <IconPrinter className="size-3.5 mr-1.5" />
      {printing ? "Printing..." : "Print"}
    </Button>
  )
}

export const columns: ColumnDef<OrderResponse>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.getValue("invoiceNumber")}</span>
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
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <PrintReceiptButton order={row.original} />
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
