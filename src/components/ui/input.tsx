import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border border-brand-umber/20 bg-white px-4 text-sm text-brand-umber shadow-[0_6px_18px_rgba(74,43,40,0.08)] ring-offset-background placeholder:text-brand-umber/40 focus-visible:outline-none focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 invalid:border-brand-coral invalid:text-brand-coral disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
