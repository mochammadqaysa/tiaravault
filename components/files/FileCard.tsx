"use client";

import { useState } from "react";
import { Download, Trash2, Eye, MoreVertical, Calendar, HardDrive } from "lucide-react";
import { FileTypeIconWrapper } from "@/components/files/FileTypeIcon";
import { Badge } from "@/components/ui/Badge";
import { formatBytes, formatRelativeDate } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";

interface FileCardProps {
  file: {
    id: string;
    originalName: string;
    mimeType: string;
    size: string | bigint;
    isViewable: boolean;
    downloadCount: number;
    createdAt: string | Date;
    extension: string;
  };
  uploadType?: "FILE" | "FOLDER";
  onView?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  className?: string;
}


export function FileCard({
  file,
  uploadType,
  onView,
  onDelete,
  className,
}: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const size =
    typeof file.size === "bigint" ? file.size : BigInt(file.size || 0);

  const handleDelete = async () => {
    if (!onDelete || deleting) return;
    if (!confirm(`Hapus file "${file.originalName}"?`)) return;
    setDeleting(true);
    await onDelete(file.id);
    setDeleting(false);
    setMenuOpen(false);
  };

  const handleDownload = () => {
    window.open(`/api/files/${file.id}/download`, "_blank");
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "group relative rounded-[18px] bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] transition-all duration-300 p-4",
        "hover:bg-[hsl(var(--surface))] active:scale-[0.98]",
        deleting && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Top row: icon + menu */}
      <div className="flex items-start justify-between mb-3">
        <FileTypeIconWrapper
          mimeType={file.mimeType}
          isFolder={uploadType === "FOLDER"}
        />

        {/* Action menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface))] transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl bg-[hsl(var(--surface))] shadow-lg border border-[hsl(var(--border))] py-1">
                {file.isViewable && (
                  <button
                    onClick={() => {
                      onView?.(file.id);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-muted))] transition-colors"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-muted))] transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--destructive))] hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* File name */}
      <p
        className="text-[17px] font-semibold text-[hsl(var(--text-primary))] truncate mb-1"
        title={file.originalName}
      >
        {file.originalName}
      </p>

      {/* File meta */}
      <div className="flex items-center gap-2 text-[12px] text-[hsl(var(--text-secondary))] mb-3">
        <HardDrive size={11} />
        <span>{formatBytes(size)}</span>
        <span>·</span>
        <Calendar size={11} />
        <span>{formatRelativeDate(new Date(file.createdAt))}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="default">{file.extension || "file"}</Badge>
        {file.isViewable && <Badge variant="info">Preview</Badge>}
      </div>
    </div>
  );
}
