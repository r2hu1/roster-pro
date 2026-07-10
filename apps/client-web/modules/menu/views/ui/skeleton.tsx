import { Skeleton } from "@workspace/ui/components/skeleton"
import React from "react"

export default function SkeletonLoader() {
  return (
    <div className="p-2 flex flex-col justify-between min-h-screen">
      <div className="flex w-fit items-center gap-4">
        <SkeletonItem className="size-18 shrink-0 rounded-full" />
        <div className="grid gap-2">
          <SkeletonItem className="h-5 w-[150px]" />
          <SkeletonItem className="h-5 w-[100px]" />
        </div>
      </div>
      <div className="my-10 ">
        <SkeletonItem className="h-15 rounded-full " />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[...Array(8)].map((_, i) => (
          <SkeletonItem key={i} className="h-50 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function SkeletonItem({ className = "" }: { className?: string }) {
  return <Skeleton className={`bg-primary/10 ${className}`} />
}
