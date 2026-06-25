"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FolderOpen, X, FileText, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  mode: "FILE" | "FOLDER";
  onFilesAccepted: (files: File[]) => void;
  maxSizeMB?: number;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function DropZone({
  mode,
  onFilesAccepted,
  maxSizeMB = 500,
  className,
}: DropZoneProps) {
  const [pendingFiles, setPendingFiles] = useState<FileWithPreview[]>([]);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setSizeError(null);
      const oversized = accepted.filter(
        (f) => f.size > maxSizeMB * 1024 * 1024
      );
      if (oversized.length > 0) {
        setSizeError(
          `${oversized.length} file melebihi batas ${maxSizeMB}MB`
        );
        return;
      }
      setPendingFiles(accepted);
      onFilesAccepted(accepted);
    },
    [maxSizeMB, onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: mode === "FILE",
    noClick: mode === "FOLDER",
    // No accept filter — allow all file types
  });

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    const updated = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(updated);
    onFilesAccepted(updated);
  };

  const clearAll = () => {
    setPendingFiles([]);
    onFilesAccepted([]);
    setSizeError(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative rounded-[18px] transition-all duration-300 p-12 text-center w-full min-h-[280px] flex flex-col items-center justify-center outline-none bg-[hsl(var(--surface-2))]",
          mode === "FILE" ? "cursor-pointer" : "",
          isDragActive
            ? "border-2 border-[hsl(var(--accent))] bg-[hsl(var(--accent-muted))/0.2]"
            : "border border-dashed border-[hsl(var(--text-secondary))/0.3] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--surface))]"
        )}
        {...getRootProps()}
      >
        {mode === "FILE" && <input {...getInputProps()} />}
        
        {mode === "FOLDER" && (
          <input
            type="file"
            // @ts-expect-error React Typescript missing webkitdirectory
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-[18px] flex items-center justify-center transition-all duration-300 bg-[hsl(var(--background))] border border-[hsl(var(--border))]",
              isDragActive ? "scale-110 border-[hsl(var(--accent))]" : ""
            )}
          >
            {mode === "FOLDER" ? (
              <FolderOpen
                size={28}
                className={cn(
                  "transition-colors duration-300",
                  isDragActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--text-secondary))]"
                )}
              />
            ) : (
              <Upload
                size={28}
                className={cn(
                  "transition-colors duration-300",
                  isDragActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--text-secondary))]"
                )}
              />
            )}
          </div>

          <div>
            <p
              className={cn(
                "text-[17px] font-semibold transition-colors duration-300",
                isDragActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--text-primary))]"
              )}
            >
              {isDragActive ? "Lepaskan file di sini..." : mode === "FOLDER" ? "Drop folder di sini" : "Drop file di sini"}
            </p>
            <p className="text-[14px] text-[hsl(var(--text-secondary))] mt-1">
              atau{" "}
              <span className="text-[hsl(var(--accent))] underline underline-offset-2">
                klik untuk memilih
              </span>
              {mode === "FILE" ? " (multiple files OK)" : " (satu folder)"}
            </p>
            <p className="text-[12px] text-[hsl(var(--text-secondary))] mt-2">
              Maks. {maxSizeMB}MB per file · Semua tipe file diterima
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {sizeError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[11px] bg-[hsl(var(--destructive))/0.1] text-[hsl(var(--destructive))] text-sm border border-[hsl(var(--destructive))/0.2]">
          <AlertCircle size={16} />
          {sizeError}
        </div>
      )}

      {/* File list preview */}
      {pendingFiles.length > 0 && (
        <div className="rounded-[18px] bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <p className="text-[14px] font-semibold text-[hsl(var(--text-primary))]">
              {pendingFiles.length} file dipilih
            </p>
            <button
              onClick={clearAll}
              className="text-[12px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))] transition-colors"
            >
              Hapus semua
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 p-2">
            {pendingFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-[11px] hover:bg-[hsl(var(--surface))] transition-colors"
              >
                <FileText
                  size={14}
                  className="text-[hsl(var(--text-secondary))] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-[hsl(var(--text-primary))] truncate">
                    {file.webkitRelativePath || file.name}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--text-secondary))]">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1.5 rounded-[8px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))/0.1] transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
