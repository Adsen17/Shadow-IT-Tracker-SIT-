import * as React from "react"
import { cn } from "@/lib/utils"

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  risk: "Low" | "Medium" | "High"
}

export function RiskBadge({ risk, className, ...props }: RiskBadgeProps) {
  const styles = {
    Low: "bg-green",
    Medium: "bg-yellow",
    High: "bg-red text-white"
  }

  return (
    <span 
      className={cn(
        "inline-flex border-2 border-ink px-2 py-1 text-xs font-black uppercase tracking-wider",
        styles[risk],
        className
      )}
      {...props}
    >
      {risk}
    </span>
  )
}
