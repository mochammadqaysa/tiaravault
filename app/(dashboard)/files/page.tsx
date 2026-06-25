"use client";

import { useState, useEffect, useCallback } from "react";
import { FileGrid } from "@/components/files/FileGrid";
import { FileViewer } from "@/components/files/FileViewer";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Folder, FileText, RefreshCw, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/fileUtils";

interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: string;
  isViewable: boolean;
  downloadCount: number;
  createdAt: string;
  extension: string;
}

interface UploadGroup {
  id: string;
  uploadType: "FILE" | "FOLDER";
  folderName?: string | null;
  totalSize: string;
  fileCount: number;
  createdAt: string;
  status: string;
  files: FileItem[];
  user?: { id: string; name: string; email: string };
}

export default function FilesPage() {
  const [uploads, setUploads] = useState<UploadGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerFile, setViewerFile] = useState<FileItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files?limit=50");
      if (res.ok) {
        const data = await res.json();
        setUploads(data.uploads || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleView = (fileId: string) => {
    const file = uploads.flatMap((u) => u.files).find((f) => f.id === fileId);
    if (file) {
      setViewerFile(file);
      setViewerOpen(true);
    }
  };

  const handleDelete = async (fileId: string) => {
    const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    if (res.ok) {
      fetchFiles();
    }
  };

  const totalSize = uploads.reduce(
    (sum, u) => sum + BigInt(u.totalSize || 0),
    BigInt(0)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
            Files
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            {uploads.length} upload · {formatBytes(totalSize)} total
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchFiles}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-24 animate-fade-in-up">
          <FolderOpen
            size={56}
            className="mx-auto text-[hsl(var(--text-secondary))] opacity-20 mb-4"
          />
          <p className="text-lg font-medium text-[hsl(var(--text-secondary))]">
            Belum ada file
          </p>
          <p className="text-sm text-[hsl(var(--text-secondary))] opacity-60 mt-1">
            Upload file pertama Anda sekarang
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="animate-fade-in-up space-y-4"
            >
              {/* Upload group header */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-7 h-7 rounded-lg bg-[hsl(var(--surface-2))] flex items-center justify-center">
                  {upload.uploadType === "FOLDER" ? (
                    <Folder size={14} className="text-yellow-400" />
                  ) : (
                    <FileText
                      size={14}
                      className="text-[hsl(var(--accent))]"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                    {upload.uploadType === "FOLDER"
                      ? upload.folderName || "Folder"
                      : `${upload.fileCount} file`}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    {formatBytes(BigInt(upload.totalSize || 0))} ·{" "}
                    {new Date(upload.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant={upload.uploadType === "FOLDER" ? "warning" : "info"}
                >
                  {upload.uploadType}
                </Badge>
              </div>

              {/* Files */}
              <FileGrid
                files={upload.files}
                uploadType={upload.uploadType}
                onView={handleView}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* File Viewer */}
      {viewerFile && (
        <FileViewer
          fileId={viewerFile.id}
          fileName={viewerFile.originalName}
          mimeType={viewerFile.mimeType}
          fileSize={viewerFile.size}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
