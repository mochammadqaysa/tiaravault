import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Ambil session user yang sedang login
 * Throw error jika tidak terautentikasi
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Cek apakah user adalah ADMIN
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/**
 * Cek apakah user bisa mengakses file tertentu
 * (harus pemilik atau ADMIN)
 */
export async function canAccessFile(
  userId: string,
  fileId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") return true;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      upload: {
        select: { userId: true },
      },
    },
  });

  return file?.upload.userId === userId;
}

/**
 * Cek apakah user bisa mengakses upload tertentu
 * (harus pemilik atau ADMIN)
 */
export async function canAccessUpload(
  userId: string,
  uploadId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") return true;

  const upload = await prisma.upload.findUnique({
    where: { id: uploadId },
    select: { userId: true },
  });

  return upload?.userId === userId;
}
