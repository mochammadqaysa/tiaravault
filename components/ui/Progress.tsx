"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
  color?: "accent" | "success" | "warning" | "danger";
}

export function Progress({
  value,
  className,
  showLabel = false,
  animated = false,
  color = "accent",
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const colors = {
    accent: "from-[hsl(var(--accent))] to-[hsl(280_80%_65%)]",
    success: "from-green-500 to-emerald-400",
    warning: "from-yellow-500 to-orange-400",
    danger: "from-red-500 to-rose-400",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full bg-[hsl(var(--surface-2))] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r",
            colors[color],
            animated && "progress-bar"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[hsl(var(--text-secondary))] mt-1">
          {clamped.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
