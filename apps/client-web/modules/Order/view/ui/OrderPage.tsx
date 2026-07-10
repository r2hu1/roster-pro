"use client";

import { sessionStoreKey } from "@/util/constant";
import { getCookie } from "@/util/Cookies";
import React, { useEffect, useState } from "react";

export default function OrderPage() {
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        const ids = sessionStorage.getItem(sessionStoreKey.id);
        if (!ids) return;

        const tableId = JSON.parse(ids).table_id;
        const orgId = JSON.parse(ids).org_id;

        const order_Id = getCookie(tableId);
        setOrderId(order_Id);
        setOrgId(orgId);
    }, []);

    useEffect(() => {
        if (!orderId) return;
        if (!orgId) return;

        console.log(`SSR req at = "/api/organization/orders/${orderId}/stream?organizationId=${orgId}"`)

        const evtSource = new EventSource(`/api/organization/orders/${orderId}/stream?organizationId=${orgId}`);

        evtSource.addEventListener("init", (event: Event) => {
            console.log("abc");
            const e = event as MessageEvent<string>;
            console.log("INIT:", JSON.parse(e.data));
        });

        evtSource.addEventListener("created", (event: Event) => {
            const e = event as MessageEvent<string>;
            console.log("CREATED:", JSON.parse(e.data));
        });

        evtSource.addEventListener("updated", (event: Event) => {
            const e = event as MessageEvent<string>;
            console.log("UPDATED:", JSON.parse(e.data));
        });

        evtSource.addEventListener("deleted", (event: Event) => {
            const e = event as MessageEvent<string>;
            console.log("DELETED:", JSON.parse(e.data));
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
    }, [orderId, orgId]);
    return <div>anc</div>;
}
