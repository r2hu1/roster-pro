import { Skeleton } from "@workspace/ui/components/skeleton";
import React from "react";

export default function SkeletonLoader() {
    return (
        <div className="p-2 flex flex-col justify-between min-h-screen">
            <div className="flex w-full items-center justify-end gap-4">
                <div className="flex flex-col justify-end  items-end gap-2">
                    <SkeletonItem className="h-5 w-[150px]" />
                    <SkeletonItem className="h-5 w-[100px]" />
                </div>
                <SkeletonItem className="size-18 shrink-0 rounded-full" />
            </div>
            <div className="flex flex-col gap-5 mt-20">
                {[...Array(3)].map((_, i) => (
                    <SkeletonItem key={i} className="h-40 rounded-lg" />
                ))}
            </div>

            <div>
                <SkeletonItem className="h-15 rounded-full " />
            </div>
        </div>
    );
}

function SkeletonItem({ className = "" }: { className?: string }) {
    return <Skeleton className={`bg-primary/10 ${className}`} />;
}
