"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Folder, Files, CheckCircle } from "lucide-react";
import { DropZone } from "@/components/upload/DropZone";
import { UploadProgress, UploadFileProgress } from "@/components/upload/UploadProgress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShimmerButton } from "@/components/magicui/ShimmerButton";
import { cn } from "@/lib/utils";

type UploadMode = "FILE" | "FOLDER";

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<UploadMode>("FILE");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadFileProgress[]>([]);
  const [done, setDone] = useState(false);
  const [folderName, setFolderName] = useState<string>("");

  const handleFilesAccepted = useCallback(
    (accepted: File[]) => {
      setFiles(accepted);
      setDone(false);
      if (mode === "FOLDER" && accepted.length > 0) {
        // Ambil nama folder dari webkitRelativePath
        const firstPath = accepted[0].webkitRelativePath;
        setFolderName(firstPath ? firstPath.split("/")[0] : "");
      }
    },
    [mode]
  );

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setDone(false);

    // Init progress
    setProgress(
      files.map((f) => ({
        name: f.name,
        size: f.size,
        progress: 0,
        status: "uploading",
      }))
    );

    try {
      const formData = new FormData();
      formData.append("uploadType", mode);
      if (mode === "FOLDER" && folderName) {
        formData.append("folderName", folderName);
      }

      files.forEach((file) => {
        formData.append("files", file);
        if (file.webkitRelativePath) {
          formData.append(`relativePath_${file.name}`, file.webkitRelativePath);
        }
      });

      // Simulate progress (actual XHR progress would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setProgress((prev) =>
          prev.map((p) =>
            p.status === "uploading" && p.progress < 85
              ? { ...p, progress: p.progress + Math.random() * 15 }
              : p
          )
        );
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (res.ok) {
        setProgress((prev) =>
          prev.map((p) => ({ ...p, progress: 100, status: "done" }))
        );
        setDone(true);
        setFiles([]);
      } else {
        const err = await res.json();
        setProgress((prev) =>
          prev.map((p) => ({
            ...p,
            status: "error",
            error: err.error || "Upload gagal",
          }))
        );
      }
    } catch {
      setProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: "error",
          error: "Koneksi gagal",
        }))
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
          Upload File
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Upload file atau folder ke storage TiaraVault Anda
        </p>
      </div>

      {/* Mode toggle */}
      <Card className="animate-fade-in-up">
        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-3">
          Mode Upload
        </p>
        <div className="flex gap-2">
          {(["FILE", "FOLDER"] as UploadMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setFiles([]);
                setProgress([]);
                setDone(false);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_inset_0_0_0_1px_rgba(255,255,255,0.02)]",
                mode === m
                  ? "bg-[hsl(var(--accent-muted)/0.8)] text-[hsl(var(--accent))] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  : "bg-[hsl(var(--surface-2))/0.4] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))/0.8] hover:text-[hsl(var(--text-primary))]"
              )}
            >
              {m === "FILE" ? <Files size={15} /> : <Folder size={15} />}
              {m === "FILE" ? "Upload File" : "Upload Folder"}
            </button>
          ))}
        </div>
        <p className="text-xs text-[hsl(var(--text-secondary))] mt-2">
          {mode === "FILE"
            ? "Pilih satu atau lebih file sekaligus"
            : "Pilih satu folder (struktur folder dipertahankan)"}
        </p>
      </Card>

      {/* Drop zone */}
      {!done && (
        <div className="animate-fade-in-up">
          <DropZone
            mode={mode}
            onFilesAccepted={handleFilesAccepted}
            maxSizeMB={500}
          />
        </div>
      )}

      {/* Upload progress */}
      {progress.length > 0 && (
        <UploadProgress files={progress} className="animate-fade-in-up" />
      )}

      {/* Success state */}
      {done && (
        <Card className="animate-fade-in-up text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                Upload Berhasil!
              </p>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                File telah tersimpan dengan aman di TiaraVault
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setDone(false);
                  setProgress([]);
                }}
              >
                Upload Lagi
              </Button>
              <Button variant="primary" onClick={() => router.push("/files")}>
                Lihat Files
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upload button */}
      {files.length > 0 && !uploading && !done && (
        <div className="w-full animate-fade-in-up">
          <ShimmerButton
            onClick={handleUpload}
            className="w-full h-14"
            shimmerColor="hsl(var(--accent))"
            background="hsl(var(--accent-muted)/0.3)"
          >
            <span className="flex items-center gap-2 text-white font-medium">
              <Upload size={18} />
              Upload {files.length} File{files.length > 1 ? "" : ""}
            </span>
          </ShimmerButton>
        </div>
      )}
    </div>
  );
}
