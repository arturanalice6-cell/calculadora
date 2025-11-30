import * as React from "react"

const buttonVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 bg-white hover:bg-gray-50",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  ghost: "hover:bg-gray-100",
  link: "text-blue-600 underline hover:text-blue-700"
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-8 text-lg",
  icon: "h-10 w-10"
}

const Button = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  size = "default", 
  asChild = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const styles = `${baseStyles} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`
  
  return React.createElement(
    asChild ? "span" : "button",
    {
      className: styles,
      ref,
      ...props
    }
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
