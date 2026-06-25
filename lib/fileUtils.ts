import path from "path";
import crypto from "crypto";

/**
 * Format bytes ke string yang mudah dibaca manusia (KB/MB/GB)
 */
export function formatBytes(bytes: bigint | number): string {
  const num = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (num === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${parseFloat((num / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format bytes ke angka GB dengan 2 desimal
 */
export function bytesToGB(bytes: bigint | number): number {
  const num = typeof bytes === "bigint" ? Number(bytes) : bytes;
  return parseFloat((num / (1024 * 1024 * 1024)).toFixed(2));
}

/**
 * Dapatkan ekstensi file dari nama file
 */
export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Tentukan MIME type berdasarkan ekstensi
 */
export function getMimeCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-7z-compressed"
  )
    return "archive";
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "spreadsheet";
  if (mimeType.startsWith("text/")) return "text";
  return "other";
}

/**
 * Apakah file bisa di-preview (view)?
 */
export function isFileViewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("video/")
  );
}

/**
 * Hitung MD5 checksum dari buffer
 */
export function computeChecksum(buffer: Buffer): string {
  return crypto.createHash("md5").update(buffer).digest("hex");
}

/**
 * Format tanggal ke string yang mudah dibaca
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format tanggal relatif (e.g. "2 jam lalu")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `${days} hari lalu`;
  if (hours > 0) return `${hours} jam lalu`;
  if (minutes > 0) return `${minutes} menit lalu`;
  return "Baru saja";
}

/**
 * Validasi ukuran file (dalam bytes)
 */
export function isFileSizeValid(
  bytes: number,
  maxMB: number = 500
): boolean {
  return bytes <= maxMB * 1024 * 1024;
}
