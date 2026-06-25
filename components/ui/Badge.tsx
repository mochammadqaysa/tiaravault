"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default:
      "bg-[hsl(var(--surface-2))/0.6] text-[hsl(var(--text-secondary))]",
    success:
      "bg-green-500/10 text-green-400",
    warning:
      "bg-yellow-500/10 text-yellow-400",
    danger:
      "bg-red-500/10 text-red-400",
    info:
      "bg-[hsl(var(--accent-muted)/0.5)] text-[hsl(var(--accent))]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_inset_0_0_0_1px_rgba(255,255,255,0.02)]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
