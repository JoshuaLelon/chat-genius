import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "form"> {
  form?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Create a new props object without the server-side attributes
    const cleanProps = { ...props };
    delete (cleanProps as any).field_signature;
    delete (cleanProps as any).form_signature;
    delete (cleanProps as any).alternative_form_signature;
    delete (cleanProps as any).visibility_annotation;
    delete (cleanProps as any).pm_parser_annotation;

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        suppressHydrationWarning
        {...cleanProps}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
