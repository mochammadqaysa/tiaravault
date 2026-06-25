"use client";

import { useState, useEffect } from "react";
import { Download, X, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatBytes } from "@/lib/fileUtils";

interface FileViewerProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: string | bigint;
  isOpen: boolean;
  onClose: () => void;
}

export function FileViewer({
  fileId,
  fileName,
  mimeType,
  fileSize,
  isOpen,
  onClose,
}: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const downloadUrl = `/api/files/${fileId}/download`;
  const inlineUrl = `/api/files/${fileId}/download?inline=true`;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
    }
  }, [isOpen, fileId]);

  const size =
    typeof fileSize === "bigint" ? fileSize : BigInt(fileSize || 0);

  const renderViewer = () => {
    if (mimeType.startsWith("image/")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={inlineUrl}
          alt={fileName}
          className="max-w-full max-h-[70vh] object-contain mx-auto rounded-xl"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Gagal memuat gambar");
          }}
        />
      );
    }

    if (mimeType === "application/pdf") {
      return (
        <iframe
          src={inlineUrl}
          className="w-full h-[70vh] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          title={fileName}
          onLoad={() => setLoading(false)}
        />
      );
    }

    if (mimeType.startsWith("video/")) {
      return (
        <video
          controls
          className="w-full max-h-[70vh] rounded-xl"
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Gagal memuat video");
          }}
        >
          <source src={inlineUrl} type={mimeType} />
          Browser Anda tidak mendukung pemutaran video.
        </video>
      );
    }

    // Non-viewable: tampilkan tombol download
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--surface-2))] flex items-center justify-center">
          <Download
            size={28}
            className="text-[hsl(var(--accent))]"
          />
        </div>
        <p className="text-[hsl(var(--text-secondary))] text-sm text-center">
          File ini tidak dapat dipreview. Silakan download untuk membukanya.
        </p>
        <Button
          onClick={() => window.open(downloadUrl, "_blank")}
          variant="primary"
        >
          <Download size={16} />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName}
      size="xl"
    >
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] pb-3 opacity-80">
          <span>{mimeType}</span>
          <span>{formatBytes(size)}</span>
        </div>

        {/* Viewer */}
        <div className="relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 py-8 text-red-400">
              <AlertCircle size={32} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!error && renderViewer()}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(inlineUrl, "_blank")}
          >
            <ExternalLink size={14} />
            Buka di Tab Baru
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(downloadUrl, "_blank")}
          >
            <Download size={14} />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
}
