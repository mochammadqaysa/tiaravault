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

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    // Admin bisa lihat semua file
    const where = userRole === "ADMIN" ? {} : { userId };

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        include: {
          files: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.upload.count({ where }),
    ]);

    // Serialize BigInt to string to avoid JSON serialization errors
    const serializedUploads = uploads.map((u) => ({
      ...u,
      totalSize: u.totalSize.toString(),
      files: u.files.map((f) => ({
        ...f,
        size: f.size.toString(),
      })),
    }));

    return NextResponse.json({
      uploads: serializedUploads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Files list error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
