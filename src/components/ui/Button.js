import React from "react";
import { cn } from "../../utils";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-primary-500 hover:bg-primary-600 text-white",
      destructive: "bg-red-500 hover:bg-red-600 text-white",
      outline:
        "border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "text-primary-500 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
