"use client";

import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  FileCode,
  Table,
  Folder,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTypeIconProps {
  mimeType: string;
  isFolder?: boolean;
  size?: number;
  className?: string;
}

export function FileTypeIcon({
  mimeType,
  isFolder,
  size = 20,
  className,
}: FileTypeIconProps) {
  if (isFolder) {
    return (
      <Folder
        size={size}
        className={cn("text-yellow-400", className)}
      />
    );
  }

  if (mimeType.startsWith("image/")) {
    return <Image size={size} className={cn("text-green-400", className)} />;
  }
  if (mimeType.startsWith("video/")) {
    return <Film size={size} className={cn("text-blue-400", className)} />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music size={size} className={cn("text-pink-400", className)} />;
  }
  if (mimeType === "application/pdf") {
    return <FileText size={size} className={cn("text-red-400", className)} />;
  }
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-7z-compressed" ||
    mimeType === "application/x-tar"
  ) {
    return <Archive size={size} className={cn("text-orange-400", className)} />;
  }
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  ) {
    return <Table size={size} className={cn("text-emerald-400", className)} />;
  }
  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("json") ||
    mimeType.includes("xml")
  ) {
    return <FileCode size={size} className={cn("text-purple-400", className)} />;
  }

  return (
    <File
      size={size}
      className={cn("text-[hsl(var(--text-secondary))]", className)}
    />
  );
}

/**
 * Wrapper div dengan background color berdasarkan tipe file
 */
export function FileTypeIconWrapper({
  mimeType,
  isFolder,
  size = 20,
}: {
  mimeType: string;
  isFolder?: boolean;
  size?: number;
}) {
  const bgMap: Record<string, string> = {
    image: "bg-green-500/10",
    video: "bg-blue-500/10",
    audio: "bg-pink-500/10",
    pdf: "bg-red-500/10",
    archive: "bg-orange-500/10",
    spreadsheet: "bg-emerald-500/10",
    code: "bg-purple-500/10",
    folder: "bg-yellow-500/10",
  };

  let key = "other";
  if (isFolder) key = "folder";
  else if (mimeType.startsWith("image/")) key = "image";
  else if (mimeType.startsWith("video/")) key = "video";
  else if (mimeType.startsWith("audio/")) key = "audio";
  else if (mimeType === "application/pdf") key = "pdf";
  else if (mimeType.includes("zip") || mimeType.includes("rar")) key = "archive";
  else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) key = "spreadsheet";
  else if (mimeType.startsWith("text/") || mimeType.includes("json")) key = "code";

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        bgMap[key] || "bg-[hsl(var(--surface-2))]"
      )}
    >
      <FileTypeIcon mimeType={mimeType} isFolder={isFolder} size={size} />
    </div>
  );
}
