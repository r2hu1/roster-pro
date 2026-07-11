"use client";

import { sessionStoreKey } from "@/lib/constant";
import { getCookie } from "@/lib/cookies";
import React, { useEffect, useState } from "react";
import InvoiceView from "./InvoiceView";
import SkeletonLoader from "./skeletonLoader";

interface InvoiceItem {
    logo: string;
    name: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    menuItemId: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerName?: string | null;
    tableNumber: string;
    status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | string;
    paymentStatus: "pending" | "paid" | "failed" | string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    roundOff: number;
    grandTotal: number;
    notes?: string | null;
    createdAt: string;
}

function statusVariant(status: string) {
    if (status === "completed" || status === "paid") return "default";
    if (status === "cancelled" || status === "failed") return "destructive";
    return "secondary";
}

export default function HandleSSE({ orderId, orgId }: { orderId: string; orgId: string }) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log(orderId);
        if (!orderId) {
            setError("Order Id not found");
            return;
        }
        if (!orgId) return;

        const evtSource = new EventSource(`/api/organization/orders/${orderId}/stream?organizationId=${orgId}`);

        evtSource.addEventListener("init", (event: Event) => {
            const e = event as MessageEvent<string>;
            if (!e.data) return;
            setInvoice(JSON.parse(e.data));
            console.log("INIT:", JSON.parse(e.data));
        });

        evtSource.addEventListener("created", (event: Event) => {
            const e = event as MessageEvent<string>;
            console.log("CREATED:", JSON.parse(e.data));
        });

        evtSource.addEventListener("updated", (event: Event) => {
            const e = event as MessageEvent<string>;
            setInvoice(JSON.parse(e.data));
        });

        evtSource.addEventListener("deleted", (event: Event) => {
            const e = event as MessageEvent<string>;
            setInvoice(JSON.parse(e.data));
        });

        evtSource.addEventListener("ping", (event: Event) => {
            const e = event as MessageEvent<string>;
            console.log("PING:", e.data);
        });

        evtSource.onerror = (error) => {
            console.error("SSE Error:", error);
        };

        evtSource.onopen = () => {
            console.log("SSE Connected");
        };

        return () => {
            evtSource.close();
        };
    }, [orderId, orgId]);

    if (error) return <div>{error}</div>;

    if (invoice) return <InvoiceView invoice={invoice} />;
    return <SkeletonLoader/>;
}
