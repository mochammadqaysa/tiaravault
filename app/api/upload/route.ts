import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import {
  isFileViewable,
  computeChecksum,
  isFileSizeValid,
  getExtension,
} from "@/lib/fileUtils";

import { rateLimit } from "@/lib/rateLimit";

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 500);

export async function POST(req: NextRequest) {
  try {
    // Autentikasi
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate Limiting: max 20 uploads per minute per user
    const rl = rateLimit(`upload_${userId}`, 20, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Coba lagi dalam 1 menit." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const uploadType = formData.get("uploadType") as "FILE" | "FOLDER";
    const folderName = formData.get("folderName") as string | null;
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!["FILE", "FOLDER"].includes(uploadType)) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    // Validasi ukuran file
    for (const file of files) {
      if (!isFileSizeValid(file.size, MAX_FILE_SIZE_MB)) {
        return NextResponse.json(
          {
            error: `File "${file.name}" melebihi batas ukuran ${MAX_FILE_SIZE_MB}MB`,
          },
          { status: 413 }
        );
      }
    }

    // Buat record Upload
    const upload = await prisma.upload.create({
      data: {
        userId,
        uploadType,
        folderName: uploadType === "FOLDER" ? folderName : null,
        status: "PENDING",
      },
    });

    const fileRecords = [];
    let totalSize = BigInt(0);

    // Proses setiap file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const checksum = computeChecksum(buffer);
      const relativePath = (formData.get(`relativePath_${file.name}`) as string) || undefined;

      const { storedName, storagePath } = await saveFile(
        buffer,
        userId,
        file.name,
        uploadType === "FOLDER" ? "folders" : "files",
        upload.id,
        relativePath
      );

      const fileRecord = await prisma.file.create({
        data: {
          uploadId: upload.id,
          originalName: file.name,
          storedName,
          storagePath,
          relativePath: relativePath || null,
          mimeType: file.type || "application/octet-stream",
          extension: getExtension(file.name),
          size: BigInt(file.size),
          checksum,
          isViewable: isFileViewable(file.type),
        },
      });

      fileRecords.push(fileRecord);
      totalSize += BigInt(file.size);
    }

    // Update Upload dengan total size dan file count
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        totalSize,
        fileCount: fileRecords.length,
        status: "COMPLETED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        uploadId: upload.id,
        fileCount: fileRecords.length,
        totalSize: totalSize.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload gagal, coba lagi" },
      { status: 500 }
    );
  }
}
