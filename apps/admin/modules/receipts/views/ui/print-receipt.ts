import type { InvoiceData } from "@workspace/shared/schemas/order/index"
import { formatCurrency } from "@workspace/shared/utils/formatter"
import { isParcelOrder } from "@workspace/shared/constants/index"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function generateReceiptHtml(invoice: InvoiceData) {
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

  return `
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
    <span>${isParcelOrder(invoice.customer.tableNumber) ? "Order Type" : "Table"}</span>
    <span>${isParcelOrder(invoice.customer.tableNumber) ? "Parcel" : esc(invoice.customer.tableNumber)}</span>
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
      <span>Payment Mode</span>
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
    `
}

export function printReceipt(invoice: InvoiceData) {
  const printWindow = window.open("", "_blank", "width=420,height=900")
  if (!printWindow) return

  const html = generateReceiptHtml(invoice)
  printWindow.document.write(html)
  printWindow.document.close()
}
