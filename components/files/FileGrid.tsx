"use client";

import { FileCard } from "./FileCard";
import { cn } from "@/lib/utils";

interface FileGridProps {
  files: {
    id: string;
    originalName: string;
    mimeType: string;
    size: string | bigint;
    isViewable: boolean;
    downloadCount: number;
    createdAt: string | Date;
    extension: string;
  }[];
  uploadType?: "FILE" | "FOLDER";
  onView?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  className?: string;
}

export function FileGrid({
  files,
  uploadType,
  onView,
  onDelete,
  className,
}: FileGridProps) {
  if (files.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {files.map((file, i) => (
        <div
          key={file.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <FileCard
            file={file}
            uploadType={uploadType}
            onView={onView}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
