"use client"

import { useState } from "react"
import type { OrderResponse } from "@workspace/shared/schemas/order/index"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { IconPrinter } from "@tabler/icons-react"
import { statusStyles, paymentStyles } from "./orders-constants"
import { useSession } from "@/modules/providers/session-provider"
import { generateInvoice } from "../../api/orders"

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

      const fmt = (n: number) => `₹${n.toFixed(2)}`

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            @page { margin: 12mm; size: A4; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.5; }
            .invoice { max-width: 210mm; margin: 0 auto; padding: 24px; }
            .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 24px; }
            .header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
            .header .meta { font-size: 12px; color: #666; margin-top: 4px; }
            .org { text-align: center; margin-top: 6px; font-size: 13px; color: #444; }
            .org p { margin: 2px 0; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
            .grid .col h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 6px; }
            .grid .col p { margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            th { background: #f5f5f5; text-align: left; padding: 10px 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; font-weight: 600; }
            td { padding: 10px 8px; border-bottom: 1px solid #eee; }
            .r { text-align: right; }
            .totals { margin-left: auto; width: 280px; }
            .totals td { padding: 5px 8px; border: none; }
            .totals tr:last-child td { font-weight: 700; font-size: 15px; border-top: 2px solid #1a1a1a; padding-top: 10px; }
            .foot { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; font-size: 12px; color: #666; }
            .thank { margin-top: 28px; text-align: center; font-size: 13px; color: #888; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>${invoice.organization.name}</h1>
              <div class="org">
                ${invoice.organization.address ? `<p>${invoice.organization.address}</p>` : ""}
                ${invoice.organization.phone ? `<p>${invoice.organization.phone}</p>` : ""}
                ${invoice.organization.gstin ? `<p>GSTIN: ${invoice.organization.gstin}</p>` : ""}
              </div>
              <div class="meta">Invoice #${invoice.invoiceNumber}</div>
            </div>
            <div class="grid">
              <div class="col">
                <h3>Bill To</h3>
                <p>${invoice.customer.name || "Guest"}</p>
                ${invoice.customer.phone ? `<p>${invoice.customer.phone}</p>` : ""}
                ${invoice.customer.email ? `<p>${invoice.customer.email}</p>` : ""}
                <p>Table: ${invoice.customer.tableNumber}</p>
              </div>
              <div class="col" style="text-align:right">
                <h3>Date</h3>
                <p>${new Date(invoice.issuedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                <h3 style="margin-top:8px">Payment</h3>
                <p style="text-transform:capitalize">${invoice.payment.status}${invoice.payment.method ? ` (${invoice.payment.method})` : ""}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width:48%">Item</th>
                  <th class="r">Qty</th>
                  <th class="r">Rate</th>
                  <th class="r">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="r">${item.quantity}</td>
                    <td class="r">${fmt(item.unitPrice)}</td>
                    <td class="r">${fmt(item.total)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="totals">
              <table>
                <tr><td>Subtotal</td><td class="r">${fmt(invoice.totals.subtotal)}</td></tr>
                ${invoice.totals.discount > 0 ? `<tr><td>Discount</td><td class="r">-${fmt(invoice.totals.discount)}</td></tr>` : ""}
                ${invoice.totals.taxableAmount > 0 ? `<tr><td>Taxable Amount</td><td class="r">${fmt(invoice.totals.taxableAmount)}</td></tr>` : ""}
                ${invoice.totals.cgst > 0 ? `<tr><td>CGST</td><td class="r">${fmt(invoice.totals.cgst)}</td></tr>` : ""}
                ${invoice.totals.sgst > 0 ? `<tr><td>SGST</td><td class="r">${fmt(invoice.totals.sgst)}</td></tr>` : ""}
                ${invoice.totals.igst > 0 ? `<tr><td>IGST</td><td class="r">${fmt(invoice.totals.igst)}</td></tr>` : ""}
                ${invoice.totals.roundOff !== 0 ? `<tr><td>Round Off</td><td class="r">${fmt(invoice.totals.roundOff)}</td></tr>` : ""}
                <tr><td>Grand Total</td><td class="r">${fmt(invoice.totals.grandTotal)}</td></tr>
              </table>
            </div>
            ${invoice.notes ? `<div class="foot">Notes: ${invoice.notes}</div>` : ""}
            <div class="thank">Thank you for your visit!</div>
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

        <div className="flex-1 space-y-5 p-5">
          {/* Status header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={statusStyles[order.status]}
              >
                {order.status}
              </Badge>
              <Badge
                variant="outline"
                className={paymentStyles[order.paymentStatus]}
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">Table</span>
              <span className="font-semibold">{order.tableNumber}</span>
            </div>
          </div>

          {/* Customer */}
          {(order.customerName || order.customerPhone) && (
            <div className="bg-muted/30 rounded-lg p-3.5 space-y-1">
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

          {/* Items */}
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
              Items ({order.items.length})
            </p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 leading-none"
                      >
                        {item.variant}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} × ₹{item.unitPrice}
                    </p>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap">
                    ₹{item.quantity * item.unitPrice}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/30 rounded-lg p-3.5 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-500">-₹{order.discount}</span>
              </div>
            )}
            {order.taxableAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span>₹{order.taxableAmount}</span>
              </div>
            )}
            {(order.cgstAmount > 0 || order.sgstAmount > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGST & SGST</span>
                <span>₹{order.cgstAmount + order.sgstAmount}</span>
              </div>
            )}
            {order.igstAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IGST</span>
                <span>₹{order.igstAmount}</span>
              </div>
            )}
            {order.roundOff !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Round Off</span>
                <span>₹{order.roundOff}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Grand Total</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </div>

          {/* Payment method */}
          {order.paymentMethod && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium capitalize">
                {order.paymentMethod}
              </span>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-muted/30 rounded-lg p-3.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                Notes
              </p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between">
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
            size="sm"
            onClick={handlePrint}
            disabled={!organization?.id || printing}
          >
            <IconPrinter className="size-3.5 mr-1.5" />
            {printing ? "Preparing..." : "Print Receipt"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
