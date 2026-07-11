"use client";

import { sessionStoreKey } from "@/lib/constant";
import { getCookie } from "@/lib/cookies";
import React, { useEffect, useState } from "react";
import HandleSSE from "./HandleSSE";
import Top from "./Top";
import BrowseMenuButton from "./BrowseMenuButton";
import { Loader2 } from "lucide-react";

export default function InvoicePage() {
    const [orderIds, setOrderIds] = useState<string[]>([]);
    const [orgId, setOrgId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initialize = () => {
            try {
                // Get session storage
                const sessionData = sessionStorage.getItem(sessionStoreKey.id);

                if (!sessionData) {
                    throw new Error("Session data not found.");
                }

                let parsedSession;

                try {
                    parsedSession = JSON.parse(sessionData);
                } catch {
                    throw new Error("Invalid session data.");
                }

                const { table_id, org_id } = parsedSession;

                if (!table_id) {
                    throw new Error("Table ID not found.");
                }

                if (!org_id) {
                    throw new Error("Organization ID not found.");
                }

                // Get cookie
                const cookie = getCookie(table_id);

                if (!cookie) {
                    throw new Error("Order ID cookie not found.");
                }

                let parsedOrders;

                try {
                    parsedOrders = JSON.parse(cookie);
                } catch {
                    throw new Error("Invalid order ID cookie.");
                }
                console.log(cookie);

                if (!Array.isArray(parsedOrders) || parsedOrders.length === 0) {
                    throw new Error("No valid order IDs found.");
                }

                setOrderIds(parsedOrders);
                setOrgId(org_id);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Something went wrong.");
                }
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    if (loading) {
        return <div className="h-screen w-screen flex justify-center items-center"><Loader2 className="animate-spin"/></div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col justify-between min-h-[80vh]">
            <Top />
            <div className="my-10 flex flex-col gap-5">
                {orderIds.map((id) => (
                    <HandleSSE key={id} orderId={id} orgId={orgId} />
                ))}
                {/* <HandleSSE key={orderIds[0]} orderId={orderIds[0] || ""} orgId={orgId} /> */}
            </div>
            <BrowseMenuButton />
        </div>
    );
}
