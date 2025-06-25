import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ml-blue/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ml-blue text-white hover:bg-ml-blue-dark shadow-sm",
        gradient: "bg-gradient-to-r from-ml-blue to-ml-blue-dark text-white shadow-xl border border-white/30 backdrop-blur-lg hover:from-ml-blue-dark hover:to-ml-blue transition-all duration-300",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline:
          "border border-ml-blue bg-white text-ml-charcoal hover:bg-ml-blue/10 shadow-sm",
        secondary:
          "bg-ml-blue/20 text-ml-charcoal hover:bg-ml-blue/30",
        ghost: "text-ml-charcoal hover:bg-ml-blue/10",
        link: "text-ml-blue hover:text-ml-navy underline-offset-4 hover:underline",
        teal: "bg-ml-teal text-white shadow-lg hover:bg-ml-teal/90 border border-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
