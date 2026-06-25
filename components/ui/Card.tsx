"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, style, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "rounded-[18px] bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] transition-all duration-300 p-6",
        onClick && "cursor-pointer hover:bg-[hsl(var(--surface))] active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardHeaderProps) {
  return (
    <h3 className={cn("text-sm font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardHeaderProps) {
  return <div className={cn("", className)}>{children}</div>;
}
