import * as React from "react"
import { cn } from "@/lib/utils"
import Loader from '@/components/ui/feedback/Loader';



export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
}

const buttonVariants = (props: { variant?: ButtonProps["variant"], size?: ButtonProps["size"], className?: string } = {}) => {
  const { variant = "default", size = "default", className } = props
  return cn(
    "inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    // Variants
    variant === "default" && "bg-indigo-500 hover:bg-indigo-600 text-white",
    variant === "destructive" && "bg-red-500 hover:bg-red-600 text-white",
    variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
    variant === "ghost" && "hover:bg-gray-100 hover:text-gray-900",
    variant === "outline" && "border border-input bg-transparent hover:bg-gray-100 hover:text-gray-900",
    variant === "link" && "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline p-0 h-auto",
    // Sizes
    size === "default" && "h-10 px-4 py-2",
    size === "sm" && "h-9 rounded-md px-3",
    size === "lg" && "h-11 rounded-md px-8",
    size === "icon" && "h-10 w-10",
    className
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader className="" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

