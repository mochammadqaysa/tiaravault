import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userRole = (session.user as { role?: string })?.role;
    const isAdmin = userRole === "ADMIN";

    if (isAdmin) {
      // Admin: statistik global
      const [totalFiles, totalUploads, totalUsers, storageSumResult, recentUploads, perUserBreakdown] =
        await Promise.all([
          prisma.file.count(),
          prisma.upload.count({ where: { status: "COMPLETED" } }),
          prisma.user.count(),
          prisma.file.aggregate({ _sum: { size: true } }),
          prisma.upload.findMany({
            where: { status: "COMPLETED" },
            include: {
              files: true,
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
          prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              uploads: {
                where: { status: "COMPLETED" },
                select: { totalSize: true, fileCount: true },
              },
            },
          }),
        ]);

      const breakdown = perUserBreakdown.map((u) => ({
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        fileCount: u.uploads.reduce((s, up) => s + up.fileCount, 0),
        storageBytes: u.uploads
          .reduce((s, up) => s + up.totalSize, BigInt(0))
          .toString(),
      }));

      return NextResponse.json({
        isAdmin: true,
        totalFiles,
        totalUploads,
        totalUsers,
        totalStorageBytes: (storageSumResult._sum.size ?? BigInt(0)).toString(),
        recentUploads,
        perUserBreakdown: breakdown,
      });
    } else {
      // User biasa: statistik personal
      const [uploads, storageSumResult, recentUploads] = await Promise.all([
        prisma.upload.findMany({
          where: { userId, status: "COMPLETED" },
          select: { fileCount: true },
        }),
        prisma.file.aggregate({
          where: { upload: { userId } },
          _sum: { size: true },
        }),
        prisma.upload.findMany({
          where: { userId, status: "COMPLETED" },
          include: { files: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      const totalFiles = uploads.reduce((s, u) => s + u.fileCount, 0);
      const totalUploads = uploads.length;

      return NextResponse.json({
        isAdmin: false,
        totalFiles,
        totalUploads,
        totalStorageBytes: (storageSumResult._sum.size ?? BigInt(0)).toString(),
        recentUploads,
      });
    }
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: "Gagal mengambil summary" }, { status: 500 });
  }
}
