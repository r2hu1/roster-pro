"use client"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@workspace/ui/components/empty"

export default function EmptyData({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <Empty className="from-muted shadow-sm to-background h-full bg-linear-to-t from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>{action}</EmptyContent>
    </Empty>
  )
}
