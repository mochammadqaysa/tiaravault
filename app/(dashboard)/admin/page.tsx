"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, FolderOpen, Users } from "lucide-react";
import { FileGrid } from "@/components/files/FileGrid";
import { FileViewer } from "@/components/files/FileViewer";
import { Badge } from "@/components/ui/Badge";
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
  files: FileItem[];
  user?: { id: string; name: string; email: string };
}

export default function AdminPage() {
  const [uploads, setUploads] = useState<UploadGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerFile, setViewerFile] = useState<FileItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files?limit=100");
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
    if (res.ok) fetchFiles();
  };

  const totalSize = uploads.reduce(
    (sum, u) => sum + BigInt(u.totalSize || 0),
    BigInt(0)
  );

  // Group uploads by user
  const byUser: Record<string, { user: UploadGroup["user"]; uploads: UploadGroup[] }> = {};
  uploads.forEach((u) => {
    const uid = u.user?.id || "unknown";
    if (!byUser[uid]) byUser[uid] = { user: u.user, uploads: [] };
    byUser[uid].uploads.push(u);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent-muted)/0.5)] flex items-center justify-center">
            <Shield size={18} className="text-[hsl(var(--accent))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
              Admin — Semua File
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
              {uploads.length} upload · {formatBytes(totalSize)} total dari semua user
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchFiles} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen size={56} className="mx-auto text-[hsl(var(--text-secondary))] opacity-20 mb-4" />
          <p className="text-lg font-medium text-[hsl(var(--text-secondary))]">Belum ada file</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(byUser).map(([uid, { user, uploads: userUploads }]) => {
            const userSize = userUploads.reduce(
              (s, u) => s + BigInt(u.totalSize || 0), BigInt(0)
            );
            return (
              <div key={uid} className="space-y-4 animate-fade-in-up">
                {/* User header */}
                <div className="flex items-center gap-3 px-3 py-3 bg-[hsl(var(--surface-2))/0.3] backdrop-blur-md rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(280_80%_65%)] flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                      {user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">
                      {user?.email} · {formatBytes(userSize)} · {userUploads.length} upload
                    </p>
                  </div>
                  <Badge variant="default">
                    <Users size={10} />
                    {userUploads.reduce((s, u) => s + u.fileCount, 0)} file
                  </Badge>
                </div>

                {/* User uploads */}
                {userUploads.map((upload) => (
                  <div key={upload.id} className="space-y-3">
                    <FileGrid
                      files={upload.files}
                      uploadType={upload.uploadType}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

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
