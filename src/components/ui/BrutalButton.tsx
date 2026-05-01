import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const BrutalButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90",
      secondary: "bg-white text-ink hover:bg-surface",
      danger: "bg-red text-white hover:bg-red/90",
      warning: "bg-yellow text-ink hover:bg-yellow/90",
      ghost: "bg-transparent border-transparent shadow-none hover:bg-ink/5 active:translate-x-0 active:translate-y-0 active:shadow-none",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10 justify-center",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 whitespace-nowrap rounded-none border-2 border-ink font-bold transition-transform",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
          variant !== "ghost" && "shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
BrutalButton.displayName = "BrutalButton"

export { BrutalButton }
