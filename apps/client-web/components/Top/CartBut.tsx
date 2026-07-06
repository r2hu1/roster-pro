"use client";

import { Button } from "@workspace/ui/components/button";
import { ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartBut() {
    const [count, setCount] = useState(0);

    const router = useRouter();

    useEffect(() => {
        const updateCount = () => {
            const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
            console.log(cart.length);
            const itemsCount = cart.reduce((total: any, item: any) => total + item.quantity, 0);
            setCount(itemsCount);
        };

        updateCount();

        window.addEventListener("cartUpdated", updateCount);

        return () => {
            window.removeEventListener("cartUpdated", updateCount);
        };
    }, []);

    return (
        <Button onClick={() => router.push("/cart")} className="relative h-10 w-10 rounded-full">
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-[#FDF9F2] text-primary">
                <span className="text-xs font-medium">{count}</span>
            </div>

            <ShoppingCart />
        </Button>
    );
}
