"use client";

import { useMemo, useState } from "react";
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
import { CartItemType } from "../../view/ui/ItemCard";
import { Loader2 } from "lucide-react";

import "../style/style.css";
import { CreateOrderDto } from "@workspace/shared";
import axios from "axios";
import SuccessDialog from "./SuccessDialog";
import { setCookie } from "@/util/Cookies";
import { orderIdTTL, sessionStoreKey } from "@/util/constant";

// Adjust to your org's actual applicable rates (or pull from org settings)
const CGST_RATE = 0.025; // 2.5%
const SGST_RATE = 0.025; // 2.5%

// const orderId = "ORD-123";

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
    const [isOpen, setIsOpen] = useState(false);
    const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);
    const [orderId, setOrderId] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const invoice = useMemo(() => {
        const subtotal = cartItem.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const taxableAmount = subtotal - discount;
        const cgstAmount = taxableAmount * CGST_RATE;
        const sgstAmount = taxableAmount * SGST_RATE;
        const rawTotal = taxableAmount + cgstAmount + sgstAmount;
        const grandTotal = Math.round(rawTotal);
        const roundOff = grandTotal - rawTotal;

        return {
            subtotal,
            discount,
            taxableAmount,
            cgstAmount,
            sgstAmount,
            roundOff,
            grandTotal,
        };
    }, [cartItem, discount]);

    const orderDate = new Date();

    async function handleSubmit() {
        // Prevent duplicate clicks
        if (isSubmitting) return;

        const ids = sessionStorage.getItem(sessionStoreKey.id);

        if(!ids) {
            throw new Error("Organization ID is missing.");
        }

        try {
            setIsSubmitting(true);

            const orgId = JSON.parse(ids).org_id;
            const tableId = JSON.parse(ids).table_id;

            if(!orgId) {
                throw new Error("Organization ID is missing.");
            }


            // Cart validation
            if (!cartItem.length) {
                throw new Error("Your cart is empty.");
            }

            // Table validation
            if (!tableNumber?.trim()) {
                throw new Error("Invalid table number.");
            }

            // Invoice validation
            if (invoice.grandTotal <= 0) {
                throw new Error("Invalid order amount.");
            }

            const orderData: CreateOrderDto = {
                organizationId: orgId,

                customerName: null,
                customerPhone: null,
                customerEmail: null,

                tableNumber,

                status: undefined,
                paymentStatus: undefined,
                paymentMethod: null,

                items: cartItem.map((item) => ({
                    menuItemId: item.id,
                    name: item.name,
                    variant: item.size as "half" | "full",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    logo: item.image ?? null,
                })),

                subtotal: invoice.subtotal,
                discount: invoice.discount,
                taxableAmount: invoice.taxableAmount,
                cgstAmount: invoice.cgstAmount,
                sgstAmount: invoice.sgstAmount,
                igstAmount: 0,
                roundOff: invoice.roundOff,
                grandTotal: invoice.grandTotal,

                notes: null,
            };

            console.log("Order Data:", orderData);

            const res = await axios.post("/api/organization/orders", orderData);

            if (res.status !== 200 && res.status !== 201) {
                throw new Error("Failed to place order.");
            }

            console.log("Order placed:", res.data);

            
            setCookie({name: tableId, value: res.data.data.id, hours: orderIdTTL});     // save cookies WRT table ID so that we can get order WRT table QR
            setOrderId(res.data.data.invoiceNumber);

            setIsOpen(false);
            setIsOrderSuccessful(true);

        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? error.message ?? "Something went wrong.";

                // toast.error(message);
                alert(message);
            } else if (error instanceof Error) {
                // toast.error(error.message);
                alert(error.message);
            } else {
                // toast.error("Unexpected error");
                alert("Unexpected error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <>
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
                                disabled={isSubmitting}
                                type="button"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                                Cancel
                            </DrawerClose>
                            <button
                                disabled={isSubmitting}
                                type="button"
                                onClick={handleSubmit}
                                className={`flex items-center justify-center gap-1 flex-1 rounded-full ${isSubmitting ? "bg-primary/50" : "bg-primary"} px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90`}
                            >
                                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Placing order..." : "Order now"}
                            </button>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <SuccessDialog
                isOrderSuccessful={isOrderSuccessful}
                setIsOrderSuccessful={setIsOrderSuccessful}
                tableNumber={tableNumber}
                orderId={orderId}
            />
        </>
    );
}
