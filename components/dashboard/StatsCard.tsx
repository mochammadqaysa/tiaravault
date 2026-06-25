"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  delay?: number;
  decimalPlaces?: number;
}

import NumberTicker from "@/components/magicui/NumberTicker";

export function StatsCard({
  title,
  value,
  suffix,
  icon,
  description,
  className,
  delay = 0,
  decimalPlaces = 0,
}: StatsCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const numericValue =
    typeof value === "number" ? value : parseFloat(String(value)) || 0;
  const isNumeric = typeof value === "number" || !isNaN(numericValue);

  return (
    <Card
      glow
      className={cn(
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[12px] font-medium text-[hsl(var(--text-secondary))] tracking-tight uppercase mb-2">
            {title}
          </p>
          <p className="text-[34px] leading-[1.1] font-semibold tracking-tight text-[hsl(var(--text-primary))] flex items-baseline gap-1">
            {visible && isNumeric ? (
              <NumberTicker value={numericValue} decimalPlaces={decimalPlaces} />
            ) : (
              <span>{value}</span>
            )}
            {suffix && (
              <span className="text-[17px] font-normal text-[hsl(var(--text-secondary))] ml-1">
                {suffix}
              </span>
            )}
          </p>
          {description && (
            <p className="text-[12px] font-normal tracking-tight text-[hsl(var(--text-secondary))] mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[hsl(var(--text-primary))] flex-shrink-0 ml-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.02)] bg-[hsl(var(--surface-2))]">
          {icon}
        </div>
      </div>
    </Card>
  );
}
