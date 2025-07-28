import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "success"
    | "danger"
    | "warning";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles =
      "group relative flex items-center justify-center font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer";

    const variants = {
      default:
        "bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 hover:border-amber-600",
      secondary:
        "bg-white/90 hover:bg-white text-amber-800 hover:text-amber-900 border border-amber-200 hover:border-amber-300",
      outline:
        "bg-white/80 hover:bg-white text-amber-800 hover:text-amber-900 border border-amber-200 hover:border-amber-300",
      ghost:
        "bg-transparent hover:bg-white/50 text-amber-800 hover:text-amber-900 border border-transparent hover:border-amber-200",
      success:
        "bg-white/90 hover:bg-white text-green-700 hover:text-green-800 border border-green-200 hover:border-green-300",
      danger:
        "bg-white/90 hover:bg-white text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300",
      warning:
        "bg-white/90 hover:bg-white text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm gap-2 h-10",
      md: "px-6 py-3 text-sm gap-2 h-12",
      lg: "px-8 py-4 text-lg gap-3 h-16",
      icon: "w-12 h-12 p-0",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
