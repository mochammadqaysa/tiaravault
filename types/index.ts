export interface UserSession {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  role: "USER" | "ADMIN";
  avatar?: string | null;
}

export interface FileItem {
  id: string;
  uploadId: string;
  originalName: string;
  storedName: string;
  storagePath: string;
  relativePath?: string | null;
  mimeType: string;
  extension: string;
  size: bigint;
  checksum?: string | null;
  isViewable: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadItem {
  id: string;
  userId: string;
  uploadType: "FILE" | "FOLDER";
  folderName?: string | null;
  totalSize: bigint;
  fileCount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  files: FileItem[];
  user?: {
    id: string;
    name: string;
    username: string;
    email?: string | null;
  };
}

export interface UserSummary {
  totalFiles: number;
  totalUploads: number;
  totalStorageBytes: bigint;
  recentUploads: UploadItem[];
}

export interface AdminSummary extends UserSummary {
  totalUsers: number;
  perUserBreakdown: {
    userId: string;
    userName: string;
    userEmail: string;
    fileCount: number;
    storageBytes: bigint;
  }[];
}

export interface UploadFileResult {
  success: boolean;
  uploadId?: string;
  fileIds?: string[];
  error?: string;
}

export type FileViewerType = "image" | "pdf" | "video" | "download";

export function getViewerType(mimeType: string): FileViewerType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  return "download";
}
