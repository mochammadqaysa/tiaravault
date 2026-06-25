"use client";

import { formatBytes } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";
import { HardDrive } from "lucide-react";

interface StorageBarProps {
  usedBytes: bigint | number;
  totalBytes?: bigint | number;
  className?: string;
}

export function StorageBar({
  usedBytes,
  totalBytes,
  className,
}: StorageBarProps) {
  const used = typeof usedBytes === "bigint" ? Number(usedBytes) : usedBytes;
  const total =
    totalBytes !== undefined
      ? typeof totalBytes === "bigint"
        ? Number(totalBytes)
        : totalBytes
      : null;

  const percentage = total ? Math.min((used / total) * 100, 100) : null;
  const progressColor =
    percentage && percentage > 90
      ? "from-red-500 to-rose-400"
      : percentage && percentage > 70
      ? "from-yellow-500 to-orange-400"
      : "from-[hsl(var(--accent))] to-[hsl(280_80%_65%)]";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
          <HardDrive size={14} className="text-[hsl(var(--accent))]" />
          <span>Storage Digunakan</span>
        </div>
        <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
          {formatBytes(usedBytes)}
          {total && (
            <span className="text-[hsl(var(--text-secondary))] font-normal">
              {" "}
              / {formatBytes(totalBytes!)}
            </span>
          )}
        </span>
      </div>

      {percentage !== null && (
        <>
          <div className="h-2.5 bg-[hsl(var(--surface-2))] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
                progressColor
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            {percentage.toFixed(1)}% dari total kapasitas
          </p>
        </>
      )}
    </div>
  );
}
