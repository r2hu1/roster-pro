import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2, Clock } from "lucide-react";
import FormatPrice from "@/lib/format-price";
import { Invoice } from "./HandleSSE";
import Top from "./Top";
import BrowseMenuButton from "./BrowseMenuButton";

function statusVariant(status: string) {
    if (status === "completed" || status === "paid") return "default";
    if (status === "cancelled" || status === "failed") return "destructive";
    return "secondary";
}

export default function InvoiceView({ invoice }: { invoice: Invoice }) {
    const isInterState = invoice.igstAmount > 0;
    const orderDate = new Date(invoice.createdAt);

    return (
        <>
            
            <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-primary/50 bg-card p-5">
                {/* Header */}

                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col items-start gap-1.5">
                        <div className=" flex text-xs items-center text-muted-foreground gap-2">
                            <p>Status: </p>
                            <Badge variant={statusVariant(invoice.status)} className="capitalize">
                                {invoice.status === "pending" ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
                                {invoice.status}
                            </Badge>
                        </div>
                        <div className=" flex text-xs items-center text-muted-foreground gap-2">
                            <p>Payment: </p>
                            <Badge variant={statusVariant(invoice.paymentStatus)} className="capitalize">
                                {invoice.paymentStatus}
                            </Badge>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-end text-muted-foreground">Invoice</p>
                        <p className="font-heading text-lg font-semibold text-primary">{invoice.invoiceNumber}</p>
                    </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">
                        Table <span className="font-semibold text-foreground">{invoice.tableNumber}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {orderDate.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                        {" · "}
                        {orderDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-4 border-t border-dashed border-border pt-4">
                    {invoice.items.map((item) => (
                        <div key={item.menuItemId} className="flex items-center gap-3">
                            <img src={item.logo} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                                <p className="text-xs capitalize text-muted-foreground">
                                    {item.variant} · {item.quantity} × {FormatPrice(item.unitPrice)}
                                </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                                {FormatPrice(item.unitPrice * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2 border-t border-dashed border-border pt-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="tabular-nums text-foreground">{FormatPrice(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Discount</span>
                            <span className="tabular-nums text-foreground">- {FormatPrice(invoice.discount)}</span>
                        </div>
                    )}
                    {isInterState ? (
                        <div className="flex justify-between text-muted-foreground">
                            <span>IGST ({invoice.gstRate}%)</span>
                            <span className="tabular-nums text-foreground">{FormatPrice(invoice.igstAmount)}</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between text-muted-foreground">
                                <span>CGST ({invoice.gstRate / 2}%)</span>
                                <span className="tabular-nums text-foreground">{FormatPrice(invoice.cgstAmount)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>SGST ({invoice.gstRate / 2}%)</span>
                                <span className="tabular-nums text-foreground">{FormatPrice(invoice.sgstAmount)}</span>
                            </div>
                        </>
                    )}
                    {invoice.roundOff !== 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Round off</span>
                            <span className="tabular-nums text-foreground">
                                {invoice.roundOff > 0 ? "+" : ""}
                                {FormatPrice(invoice.roundOff)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Grand total */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-base font-semibold text-primary">Grand total</span>
                    <span className="text-2xl font-bold tabular-nums text-primary">{FormatPrice(invoice.grandTotal)}</span>
                </div>

                {invoice.notes && <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">{invoice.notes}</p>}
            </div>
        </>
    );
}
