import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET logged-in user profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { uploads: true } },
        uploads: { select: { totalSize: true, fileCount: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const fileCount = user.uploads.reduce((s: number, up: { fileCount: number }) => s + up.fileCount, 0);
    const storageBytes = user.uploads
      .reduce((s: bigint, up: { totalSize: bigint }) => s + up.totalSize, BigInt(0))
      .toString();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email || "",
        role: user.role,
        createdAt: user.createdAt,
        uploadCount: user._count.uploads,
        fileCount,
        storageBytes,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Gagal mengambil profil" }, { status: 500 });
  }
}

// PUT update logged-in user profile (name, username, email)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username, email } = await req.json();
    if (!name || !username) {
      return NextResponse.json({ error: "Nama dan username wajib diisi" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    const usernameCheck = await prisma.user.findFirst({
      where: {
        username: cleanUsername,
        NOT: { id: session.user.id },
      },
    });

    if (usernameCheck) {
      return NextResponse.json({ error: "Username sudah digunakan oleh user lain" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: email ? email.toLowerCase().trim() : null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}

// PATCH change logged-in user password
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (oldPassword) {
      const isValid = await bcrypt.compare(oldPassword, currentUser.password);
      if (!isValid) {
        return NextResponse.json({ error: "Password lama tidak sesuai" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Change own password error:", error);
    return NextResponse.json({ error: "Gagal mengubah password" }, { status: 500 });
  }
}
