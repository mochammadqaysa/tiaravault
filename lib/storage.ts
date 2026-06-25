import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";

const UPLOAD_BASE =
  process.env.UPLOAD_DIR || "/var/tiaravault/uploads";

/**
 * Pastikan direktori ada, buat jika belum ada
 */
async function ensureDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Simpan file ke disk
 * @param buffer - Buffer konten file
 * @param userId - ID user pemilik
 * @param originalName - Nama asli file
 * @param uploadType - 'files' atau 'folders'
 * @param uploadId - ID upload session (untuk folder)
 * @param relativePath - Path relatif dalam folder (untuk folder)
 */
export async function saveFile(
  buffer: Buffer,
  userId: string,
  originalName: string,
  uploadType: "files" | "folders",
  uploadId?: string,
  relativePath?: string
): Promise<{ storedName: string; storagePath: string }> {
  const ext = path.extname(originalName);
  const storedName = `${randomUUID()}${ext}`;

  let dirPath: string;
  if (uploadType === "folders" && uploadId) {
    const relDir = relativePath ? path.dirname(relativePath) : "";
    dirPath = path.join(UPLOAD_BASE, userId, "folders", uploadId, relDir);
  } else {
    dirPath = path.join(UPLOAD_BASE, userId, "files");
  }

  await ensureDir(dirPath);

  const storagePath = path.join(dirPath, storedName);
  await fs.writeFile(storagePath, buffer);

  return { storedName, storagePath };
}

/**
 * Hapus file dari disk
 */
export async function deleteFile(storagePath: string): Promise<void> {
  try {
    if (existsSync(storagePath)) {
      await fs.unlink(storagePath);
    }
  } catch (err) {
    console.error("Failed to delete file:", storagePath, err);
  }
}

/**
 * Hapus direktori upload folder secara rekursif
 */
export async function deleteUploadDir(
  userId: string,
  uploadId: string
): Promise<void> {
  const dirPath = path.join(UPLOAD_BASE, userId, "folders", uploadId);
  try {
    if (existsSync(dirPath)) {
      await fs.rm(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error("Failed to delete upload dir:", dirPath, err);
  }
}

/**
 * Buat read stream untuk download/streaming file
 */
export function createFileStream(storagePath: string) {
  return createReadStream(storagePath);
}

/**
 * Ambil ukuran file dari disk (bytes)
 */
export async function getFileSize(storagePath: string): Promise<number> {
  const stat = await fs.stat(storagePath);
  return stat.size;
}
