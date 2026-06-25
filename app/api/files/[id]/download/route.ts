import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessFile } from "@/lib/permissions";
import { existsSync, createReadStream } from "fs";
import { stat } from "fs/promises";

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

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    if (!existsSync(file.storagePath)) {
      return NextResponse.json(
        { error: "File tidak ada di server" },
        { status: 404 }
      );
    }

    // Increment download count
    await prisma.file.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    const fileStat = await stat(file.storagePath);
    const fileSize = fileStat.size;

    // Cek apakah ada request range (untuk video streaming)
    const range = req.headers.get("range");

    if (range && file.mimeType.startsWith("video/")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = createReadStream(file.storagePath, { start, end });
      const nodeStream = stream as unknown as ReadableStream;

      return new NextResponse(nodeStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": file.mimeType,
        },
      });
    }

    // Tentukan apakah inline (viewer) atau attachment (download)
    const { searchParams } = new URL(req.url);
    const inline = searchParams.get("inline") === "true";
    const disposition = inline
      ? `inline; filename="${file.originalName}"`
      : `attachment; filename="${file.originalName}"`;

    const stream = createReadStream(file.storagePath);
    const nodeStream = stream as unknown as ReadableStream;

    return new NextResponse(nodeStream, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": disposition,
        "Content-Length": fileSize.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Gagal mendownload file" },
      { status: 500 }
    );
  }
}
