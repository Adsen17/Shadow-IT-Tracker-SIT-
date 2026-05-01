import * as React from "react"
import { cn } from "@/lib/utils"

const BrutalCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-none border-2 border-ink bg-white shadow-brutal-lg text-ink",
        className
      )}
      {...props}
    />
  )
)
BrutalCard.displayName = "BrutalCard"

const BrutalCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 border-b-2 border-ink", className)}
      {...props}
    />
  )
)
BrutalCardHeader.displayName = "BrutalCardHeader"

const BrutalCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-bold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
BrutalCardTitle.displayName = "BrutalCardTitle"

const BrutalCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted", className)}
      {...props}
    />
  )
)
BrutalCardDescription.displayName = "BrutalCardDescription"

const BrutalCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
)
BrutalCardContent.displayName = "BrutalCardContent"

const BrutalCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
BrutalCardFooter.displayName = "BrutalCardFooter"

export { BrutalCard, BrutalCardHeader, BrutalCardFooter, BrutalCardTitle, BrutalCardDescription, BrutalCardContent }
