import { ArrowLeft } from "lucide-react";
import React from "react";
import NextImage from "next/image";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";

export default function Top() {
    const router = useRouter();
    return (
        <div className=" p-2 bg-white   w-full top-0 flex justify-end items-center">
            {/* <button type="button" onClick={() => router.back()} className="ml-5">
                <ArrowLeft size={22} />
            </button> */}
            <div className="flex items-center gap-2">
                <div className="flex flex-col justify-center text-right">
                    <h1 className="text-font-heading  text-lg font-extrabold ">Track Your Order</h1>
                    {/* <p className="text-foreground/50 leading-4">Track Your Order</p> */}
                    

                    <span className="inline-flex ml-auto items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        LIVE
                    </span>
                </div>
                <NextImage src="/logo.jpeg" width={60} height={60} alt="logo" />
            </div>
        </div>
    );
}
