"use client"

import { sessionStoreKey } from "@/lib/constant";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";


export default function BrowseMenuButton() {
    const [id, setId] = useState()
    const router = useRouter();

    useEffect(() => {
        const ids = sessionStorage.getItem(sessionStoreKey.id)
        if (!ids) return

        const qrId = JSON.parse(ids).QR_id
        if(!qrId) return
        setId(qrId)
    }, [id])
    return (
        <div className="flex justify-center">
            <Button onClick={() => id? router.push(`/${id}`) : router.back()} className="w-1/2 py-5">
                <ArrowLeft size={22} />
                Browse Menu
            </Button>
        </div>
    );
}
