"use client"

import { useRef, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Loader } from "@workspace/ui/components/loader"

export function LoadMoreSentinel({
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasMore) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, onLoadMore])

  if (!hasMore) return null

  return (
    <div ref={ref} className="flex justify-center py-6">
      <Button variant="secondary" onClick={onLoadMore} disabled={loadingMore}>
        Load more
        {loadingMore && <Loader />}
      </Button>
    </div>
  )
}
