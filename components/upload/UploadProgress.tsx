"use client";

import { CheckCircle, XCircle, FileText } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { formatBytes } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";

export interface UploadFileProgress {
  name: string;
  size: number;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UploadProgressProps {
  files: UploadFileProgress[];
  className?: string;
}


export function UploadProgress({ files, className }: UploadProgressProps) {
  if (files.length === 0) return null;

  const totalProgress =
    files.reduce((sum, f) => sum + f.progress, 0) / files.length;
  const allDone = files.every((f) => f.status === "done" || f.status === "error");
  const hasError = files.some((f) => f.status === "error");

  return (
    <div className={cn("overflow-hidden rounded-[18px] bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] shadow-sm", className)}>
      {/* Overall progress */}
      <div className="px-4 py-4 bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[14px] font-semibold text-[hsl(var(--text-primary))]">
            {allDone
              ? hasError
                ? "Upload selesai dengan error"
                : "Upload berhasil!"
              : `Mengupload ${files.length} file...`}
          </p>
          <span className="text-[12px] text-[hsl(var(--text-secondary))]">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <Progress
          value={totalProgress}
          animated={!allDone}
          color={hasError ? "danger" : allDone ? "success" : "accent"}
        />
      </div>

      {/* Per-file progress */}
      <div className="max-h-64 overflow-y-auto space-y-1 p-2">
        {files.map((file, i) => (
          <div key={`${file.name}-${i}`} className="px-4 py-3 rounded-[11px] hover:bg-[hsl(var(--surface))] transition-colors">
            <div className="flex items-center gap-3 mb-1.5">
              <FileText
                size={14}
                className="text-[hsl(var(--text-secondary))] flex-shrink-0"
              />
              <p className="flex-1 text-[14px] text-[hsl(var(--text-primary))] truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[12px] text-[hsl(var(--text-secondary))]">
                  {formatBytes(file.size)}
                </span>
                {file.status === "done" && (
                  <CheckCircle size={14} className="text-[hsl(var(--success))]" />
                )}
                {file.status === "error" && (
                  <XCircle size={14} className="text-[hsl(var(--destructive))]" />
                )}
              </div>
            </div>

            {file.status !== "pending" && (
              <Progress
                value={file.progress}
                animated={file.status === "uploading"}
                color={
                  file.status === "error"
                    ? "danger"
                    : file.status === "done"
                    ? "success"
                    : "accent"
                }
              />
            )}

            {file.error && (
              <p className="text-[12px] text-[hsl(var(--destructive))] mt-1">{file.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
