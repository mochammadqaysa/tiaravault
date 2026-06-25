"use client";

import Link from "next/link";
import {
  FileText,
  Folder,
  Image,
  Film,
  Archive,
  ChevronRight,
} from "lucide-react";
import { formatBytes, formatRelativeDate } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/AnimatedList";

export interface UploadItem {
  id: string;
  uploadType: "FILE" | "FOLDER";
  folderName?: string | null;
  totalSize: string | bigint;
  fileCount: number;
  createdAt: string | Date;
  files: {
    id: string;
    mimeType: string;
    originalName: string;
  }[];
}

interface RecentUploadsProps {
  uploads: UploadItem[];
  className?: string;
}

function getUploadIcon(upload: UploadItem) {
  if (upload.uploadType === "FOLDER") return Folder;
  const mime = upload.files[0]?.mimeType || "";
  if (mime.startsWith("image/")) return Image;
  if (mime.startsWith("video/")) return Film;
  if (mime.includes("zip") || mime.includes("rar")) return Archive;
  return FileText;
}

function getUploadName(upload: UploadItem) {
  if (upload.uploadType === "FOLDER") return upload.folderName || "Folder";
  if (upload.files.length === 1) return upload.files[0].originalName;
  return `${upload.fileCount} file`;
}

export function RecentUploads({ uploads, className }: RecentUploadsProps) {
  if (uploads.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <FileText
          size={40}
          className="mx-auto text-[hsl(var(--text-secondary))] mb-3 opacity-30"
        />
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Belum ada upload
        </p>
      </div>
    );
  }

  return (
    <AnimatedList className={cn("w-full gap-1", className)}>
      {uploads.map((upload) => {
        const Icon = getUploadIcon(upload);
        const name = getUploadName(upload);
        const size =
          typeof upload.totalSize === "bigint"
            ? upload.totalSize
            : BigInt(upload.totalSize || 0);

        return (
          <Link
            key={upload.id}
            href={`/files`}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-all duration-200 group"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                upload.uploadType === "FOLDER"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-[hsl(var(--accent-muted)/0.5)] text-[hsl(var(--accent))]"
              )}
            >
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                {name}
              </p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                {formatBytes(size)} ·{" "}
                {formatRelativeDate(new Date(upload.createdAt))}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-[hsl(var(--text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        );
      })}
    </AnimatedList>
  );
}
