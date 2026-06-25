import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessFile } from "@/lib/permissions";
import { deleteFile } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const hasAccess = await canAccessFile(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        upload: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("File detail error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const hasAccess = await canAccessFile(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    // Hapus dari disk
    await deleteFile(file.storagePath);

    // Hapus record dari database
    await prisma.file.delete({ where: { id } });

    // Update upload totalSize dan fileCount
    const remainingFiles = await prisma.file.findMany({
      where: { uploadId: file.uploadId },
    });

    if (remainingFiles.length === 0) {
      // Hapus upload jika tidak ada file tersisa
      await prisma.upload.delete({ where: { id: file.uploadId } });
    } else {
      const newTotalSize = remainingFiles.reduce(
        (sum, f) => sum + f.size,
        BigInt(0)
      );
      await prisma.upload.update({
        where: { id: file.uploadId },
        data: {
          totalSize: newTotalSize,
          fileCount: remainingFiles.length,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File delete error:", error);
    return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
  }
}
