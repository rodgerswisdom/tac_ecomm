import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-wide ring-offset-background transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 shadow-[0_12px_30px_var(--shadow-soft)]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-umber text-brand-beige hover:bg-brand-umber/90 hover:shadow-[0_16px_36px_rgba(74,43,40,0.25)]",
        destructive: "bg-brand-coral text-white hover:bg-brand-coral/90",
        outline:
          "border border-brand-umber bg-transparent text-brand-umber hover:bg-brand-umber hover:text-brand-beige",
        secondary: "bg-brand-jade text-brand-umber hover:bg-brand-jade/80",
        ghost:
          "bg-transparent text-brand-umber hover:bg-brand-umber/10 hover:text-brand-umber focus-visible:ring-brand-teal",
        link: "text-brand-teal underline-offset-4 hover:text-brand-coral",
        gold:
          "bg-brand-gold text-white hover:bg-brand-gold/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
