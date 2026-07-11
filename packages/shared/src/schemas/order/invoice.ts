export interface InvoiceData {
  invoiceNumber: string
  issuedAt: string
  organization: {
    id: string
    name: string
    address: string | null
    phone: string | null
    gstin: string | null
    hsnSac: number | null
    gstRate: number | null
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
    gstRate: number
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
