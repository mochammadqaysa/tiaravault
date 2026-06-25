"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white focus:ring-[hsl(var(--accent))] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
      secondary:
        "bg-[hsl(var(--surface-2))/0.6] hover:bg-[hsl(var(--surface-2))/0.8] backdrop-blur-md text-[hsl(var(--text-primary))] focus:ring-[hsl(var(--border))] rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.02)]",
      ghost:
        "bg-transparent hover:bg-[hsl(var(--surface-2))/0.4] text-[hsl(var(--text-primary))] focus:ring-[hsl(var(--border))] rounded-[8px]",
      danger:
        "bg-[hsl(var(--destructive))] hover:bg-red-500 text-white focus:ring-red-500 rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
      outline:
        "bg-[hsl(var(--surface-2))/0.3] hover:bg-[hsl(var(--surface-2))/0.6] backdrop-blur-md text-[hsl(var(--text-primary))] focus:ring-[hsl(var(--border))] rounded-[8px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.02)]",
    };

    const sizes = {
      sm: "text-[14px] px-3 py-1.5",
      md: "text-[15px] px-4 py-2",
      lg: "text-[17px] px-[22px] py-[11px]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
