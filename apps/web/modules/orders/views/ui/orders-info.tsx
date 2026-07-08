"use client"

import { useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { IconPrinter } from "@tabler/icons-react"
import { useSession } from "@/modules/providers/session-provider"
import { generateInvoice } from "../../api/orders"
import { OrderStatusSelect, PaymentStatusSelect } from "./order-status-controls"
import { OrderItemsList } from "./order-items-list"
import { OrderTotalsSummary } from "./order-totals-summary"

interface InvoiceData {
  invoiceNumber: string
  issuedAt: string
  organization: {
    id: string
    name: string
    address: string | null
    phone: string | null
    gstin: string | null
  }
  customer: {
    name: string | null
    email: string | null
    phone: string | null
    tableNumber: string
  }
  items: Array<{
    id: string
    name: string
    logo: string | null
    quantity: number
    unitPrice: number
    total: number
  }>
  totals: {
    subtotal: number
    discount: number
    taxableAmount: number
    cgst: number
    sgst: number
    igst: number
    roundOff: number
    grandTotal: number
  }
  payment: {
    status: string
    method: string | null
  }
  notes: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export default function OrdersInfo({
  order,
  children,
}: {
  order: OrderResponse
  children: React.ReactNode
}) {
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

      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      const fmt = (n: number) => `Rs.${n.toFixed(2)}`
      const esc = escapeHtml

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt ${esc(invoice.invoiceNumber)}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100%;
              font-family: 'Courier New', 'Consolas', monospace;
              color: #000;
              font-size: 12px;
              line-height: 1.4;
            }
            .receipt {
              width: 80mm;
              margin: 0 auto;
              padding: 6mm 4mm;
            }
            .receipt { padding: 6mm 4mm; }
            .center { text-align: center; }
            .bold { font-weight: 700; }
            .big { font-size: 15px; }
            .header { margin-bottom: 8px; }
            .header h1 { font-size: 16px; font-weight: 700; text-transform: uppercase; }
            .header p { font-size: 11px; margin-top: 2px; }
            .dashed { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 6px 0; }
            th { text-align: left; font-weight: 700; padding: 2px 0; border-bottom: 1px dashed #000; }
            th.r, td.r { text-align: right; }
            td { padding: 3px 0; vertical-align: top; }
            .item-name { padding-right: 4px; }
            .totals-row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
            .grand { font-size: 14px; font-weight: 700; border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px; }
            .foot { margin-top: 10px; font-size: 10px; text-align: center; }
            .thank { margin-top: 14px; text-align: center; font-size: 12px; font-weight: 700; }
            .barcode-space { text-align: center; margin-top: 10px; font-size: 10px; letter-spacing: 2px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header center">
              <h1>${esc(invoice.organization.name)}</h1>
              ${invoice.organization.address ? `<p>${esc(invoice.organization.address)}</p>` : ""}
              ${invoice.organization.phone ? `<p>Tel: ${esc(invoice.organization.phone)}</p>` : ""}
              ${invoice.organization.gstin ? `<p>GSTIN: ${esc(invoice.organization.gstin)}</p>` : ""}
            </div>

            <div class="dashed"></div>

            <div class="row"><span>Receipt#</span><span class="bold">${esc(invoice.invoiceNumber)}</span></div>
            <div class="row"><span>Date</span><span>${new Date(invoice.issuedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span></div>
            <div class="row"><span>Time</span><span>${new Date(invoice.issuedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
            <div class="row"><span>Table</span><span>${esc(invoice.customer.tableNumber)}</span></div>
            <div class="row"><span>Customer</span><span>${esc(invoice.customer.name || "Guest")}</span></div>

            <div class="dashed"></div>

            <table>
              <thead>
                <tr>
                  <th style="width:50%">Item</th>
                  <th class="r">Qty</th>
                  <th class="r">Rate</th>
                  <th class="r">Amt</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                  <tr>
                    <td class="item-name">${esc(item.name)}</td>
                    <td class="r">${item.quantity}</td>
                    <td class="r">${item.unitPrice.toFixed(2)}</td>
                    <td class="r">${item.total.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="dashed"></div>

            <div class="totals-row"><span>Subtotal</span><span>${fmt(invoice.totals.subtotal)}</span></div>
            ${invoice.totals.discount > 0 ? `<div class="totals-row"><span>Discount</span><span>-${fmt(invoice.totals.discount)}</span></div>` : ""}
            ${invoice.totals.taxableAmount > 0 ? `<div class="totals-row"><span>Taxable Amt</span><span>${fmt(invoice.totals.taxableAmount)}</span></div>` : ""}
            ${invoice.totals.cgst > 0 ? `<div class="totals-row"><span>CGST</span><span>${fmt(invoice.totals.cgst)}</span></div>` : ""}
            ${invoice.totals.sgst > 0 ? `<div class="totals-row"><span>SGST</span><span>${fmt(invoice.totals.sgst)}</span></div>` : ""}
            ${invoice.totals.igst > 0 ? `<div class="totals-row"><span>IGST</span><span>${fmt(invoice.totals.igst)}</span></div>` : ""}
            ${invoice.totals.roundOff !== 0 ? `<div class="totals-row"><span>Round Off</span><span>${fmt(invoice.totals.roundOff)}</span></div>` : ""}

            <div class="totals-row grand"><span>TOTAL</span><span>${fmt(invoice.totals.grandTotal)}</span></div>

            <div class="dashed"></div>

            <div class="row">
              <span>Payment</span>
              <span style="text-transform:capitalize">${esc(invoice.payment.status)}${invoice.payment.method ? ` (${esc(invoice.payment.method)})` : ""}</span>
            </div>

            ${invoice.notes ? `<div class="foot">Notes: ${esc(invoice.notes)}</div>` : ""}

            <div class="thank">*** THANK YOU, VISIT AGAIN ***</div>
            <div class="barcode-space">${esc(invoice.invoiceNumber)}</div>
          </div>
          <script>window.print()</script>
        </body>
        </html>
      `)
      printWindow.document.close()
    } catch {
      //
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-normal">
              Order
            </span>
            <span className="font-mono">{order.invoiceNumber}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 p-4 pt-0">
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <span className="text-muted-foreground font-medium text-sm">Table Number</span>
              <span className="text-3xl font-semibold">{order.tableNumber}</span>
            </div>
            <OrderStatusSelect orderId={order.id} initial={order.status} />
            <PaymentStatusSelect orderId={order.id} initial={order.paymentStatus} />
          </div>

          {(order.customerName || order.customerPhone) && (
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                Customer
              </p>
              {order.customerName && (
                <p className="text-sm font-medium">{order.customerName}</p>
              )}
              {order.customerPhone && (
                <p className="text-sm text-muted-foreground">
                  {order.customerPhone}
                </p>
              )}
            </div>
          )}

          <OrderItemsList items={order.items} />
          <OrderTotalsSummary order={order} />

          {order.notes && (
            <div className="rounded-lg border p-3.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                Notes
              </p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <Button
              size="lg"
              onClick={handlePrint}
              disabled={!organization?.id || printing}
            >
              <IconPrinter className="size-3.5 mr-1.5" />
              {printing ? "Preparing..." : "Print Receipt"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
