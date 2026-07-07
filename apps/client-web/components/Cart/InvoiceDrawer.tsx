"use client";

import { useMemo } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import FormatPrice from "@/util/FormatPrice";
import { CartItemType } from "./ItemCard";
import { ShoppingCart } from "lucide-react";

// Adjust to your org's actual applicable rates (or pull from org settings)
const CGST_RATE = 0.025; // 2.5%
const SGST_RATE = 0.025; // 2.5%

interface InvoiceDrawerProps {
    cartItem: CartItemType[];
    tableNumber: string;
    discount?: number;
    onPlaceOrder: (invoice: {
        subtotal: number;
        discount: number;
        taxableAmount: number;
        cgstAmount: number;
        sgstAmount: number;
        roundOff: number;
        grandTotal: number;
    }) => void;
}

export default function InvoiceDrawer({ cartItem, tableNumber, discount = 0, onPlaceOrder }: InvoiceDrawerProps) {
    const invoice = useMemo(() => {
        const subtotal = cartItem.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const taxableAmount = subtotal - discount;
        const cgstAmount = taxableAmount * CGST_RATE;
        const sgstAmount = taxableAmount * SGST_RATE;
        const rawTotal = taxableAmount + cgstAmount + sgstAmount;
        const grandTotal = Math.round(rawTotal);
        const roundOff = grandTotal - rawTotal;

        return { subtotal, discount, taxableAmount, cgstAmount, sgstAmount, roundOff, grandTotal };
    }, [cartItem, discount]);

    const orderDate = new Date();

    function handleSubmit() {
        const orderData = {
            // You'll get this from your auth/session later
            organizationId: "YOUR_ORGANIZATION_ID",

            // Customer details (not available yet)
            customerName: null,
            customerPhone: null,
            customerEmail: null,

            // Table
            tableNumber,

            // These will probably come from your backend defaults
            status: undefined,
            paymentStatus: undefined,
            paymentMethod: null,

            // Convert cart items into order items
            items: cartItem.map((item) => ({
                // Include whatever your CreateOrderItemSchema expects
                menuItemId: item.id,
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity,
            })),

            // Invoice values
            subtotal: invoice.subtotal,
            discount: invoice.discount,
            taxableAmount: invoice.taxableAmount,
            cgstAmount: invoice.cgstAmount,
            sgstAmount: invoice.sgstAmount,
            igstAmount: 0,
            roundOff: invoice.roundOff,
            grandTotal: invoice.grandTotal,

            // Optional notes
            notes: null,
        };

        console.log("Order Data:", orderData);

        // onPlaceOrder(invoice);
    }
    return (
        <Drawer>
            <DrawerTrigger className="w-full ">
                <Button className="w-full px-auto py-5">Place an order</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Confirm your order</DrawerTitle>
                    <DrawerDescription>Review the invoice below before placing your order.</DrawerDescription>
                </DrawerHeader>

                <div className="max-h-[60vh] overflow-y-auto px-4">
                    {/* Table + date/time */}
                    <div className="mb-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Table no.</span>
                        <span className="font-semibold text-foreground">{tableNumber}</span>
                    </div>
                    <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {orderDate.toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                        <span>
                            {orderDate.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>

                    {/* Line items */}
                    <div className="flex flex-col gap-3 border-t border-dashed border-border pt-3">
                        {cartItem.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.size} · {item.quantity} × {FormatPrice(item.unitPrice)}
                                    </p>
                                </div>
                                <span className="shrink-0 font-medium tabular-nums text-foreground">
                                    {FormatPrice(item.unitPrice * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-4 flex flex-col gap-2 border-t border-dashed border-border pt-3 text-sm">
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
                        <div className="flex justify-between text-muted-foreground">
                            <span>CGST (2.5%)</span>
                            <span className="tabular-nums text-foreground">{FormatPrice(invoice.cgstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>SGST (2.5%)</span>
                            <span className="tabular-nums text-foreground">{FormatPrice(invoice.sgstAmount)}</span>
                        </div>
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

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-base font-semibold text-foreground">Grand total</span>
                        <span className="text-xl font-bold tabular-nums text-foreground">{FormatPrice(invoice.grandTotal)}</span>
                    </div>
                </div>

                <DrawerFooter>
                    <div className="flex items-center gap-3 pt-1">
                        <DrawerClose
                            type="button"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            Cancel
                        </DrawerClose>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Order now
                        </button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
