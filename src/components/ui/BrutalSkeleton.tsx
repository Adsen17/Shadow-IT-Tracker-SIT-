import * as React from "react"
import { cn } from "@/lib/utils"

export function BrutalSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse border-2 border-ink bg-muted/20", className)}
      {...props}
    />
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b-2 border-ink">
          <BrutalSkeleton className="h-6 w-1/3" />
          <BrutalSkeleton className="h-6 w-1/4" />
          <BrutalSkeleton className="h-6 w-1/6 hidden sm:block" />
          <BrutalSkeleton className="h-6 w-1/6 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border-4 border-ink shadow-brutal p-6 space-y-4 bg-surface">
      <BrutalSkeleton className="h-4 w-1/3" />
      <BrutalSkeleton className="h-10 w-1/2" />
    </div>
  )
}
