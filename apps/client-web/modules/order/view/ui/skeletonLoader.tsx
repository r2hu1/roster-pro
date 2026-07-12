import { Skeleton } from "@workspace/ui/components/skeleton"
import React from "react"

export default function SkeletonLoader() {
  return (
    <SkeletonItem className="h-100 rounded-lg m-5" />
  )
}

function SkeletonItem({ className = "" }: { className?: string }) {
  return <Skeleton className={`bg-primary/10 ${className}`} />
}
