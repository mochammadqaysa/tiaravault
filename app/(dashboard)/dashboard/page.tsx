import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HardDrive, Files, Upload, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentUploads } from "@/components/dashboard/RecentUploads";
import { StorageBar } from "@/components/dashboard/StorageBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/fileUtils";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview storage dan statistik backup TiaraVault Anda",
};

async function getSummary() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/summary`, {
      headers: { Cookie: "" },
      cache: "no-store",
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as { role?: string })?.role;
  const userName = session.user.name;

  // Fetch summary via Prisma directly (server component)
  const { prisma } = await import("@/lib/prisma");
  const userId = session.user.id!;
  const isAdmin = userRole === "ADMIN";

  let stats;
  let recentUploads;

  if (isAdmin) {
    const [totalFiles, totalUploads, totalUsers, storageSumResult, uploads] =
      await Promise.all([
        prisma.file.count(),
        prisma.upload.count({ where: { status: "COMPLETED" } }),
        prisma.user.count(),
        prisma.file.aggregate({ _sum: { size: true } }),
        prisma.upload.findMany({
          where: { status: "COMPLETED" },
          include: { files: { take: 3 }, user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);
    stats = {
      totalFiles,
      totalUploads,
      totalUsers,
      totalStorageBytes: storageSumResult._sum.size ?? BigInt(0),
    };
    recentUploads = uploads;
  } else {
    const [uploads, storageSumResult, recent] = await Promise.all([
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
        include: { files: { take: 3 } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);
    stats = {
      totalFiles: uploads.reduce((s, u) => s + u.fileCount, 0),
      totalUploads: uploads.length,
      totalStorageBytes: storageSumResult._sum.size ?? BigInt(0),
    };
    recentUploads = recent;
  }

  const storageBytes = Number(stats.totalStorageBytes);

  let storageValue = storageBytes;
  let storageSuffix = "B";

  if (storageBytes >= 1024 * 1024 * 1024 * 1024) {
    storageValue = storageBytes / (1024 * 1024 * 1024 * 1024);
    storageSuffix = "TB";
  } else if (storageBytes >= 1024 * 1024 * 1024) {
    storageValue = storageBytes / (1024 * 1024 * 1024);
    storageSuffix = "GB";
  } else if (storageBytes >= 1024 * 1024) {
    storageValue = storageBytes / (1024 * 1024);
    storageSuffix = "MB";
  } else if (storageBytes >= 1024) {
    storageValue = storageBytes / 1024;
    storageSuffix = "KB";
  }

  return (
    <div className="relative min-h-full">


      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Welcome banner */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
            Selamat datang,{" "}
            <span className="gradient-text">{userName?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            {isAdmin
              ? "Tampilan admin — semua statistik platform"
              : "Ringkasan storage dan aktivitas backup Anda"}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Storage"
            value={parseFloat(storageValue.toFixed(2))}
            suffix={storageSuffix}
            icon={<HardDrive size={18} />}
            description={formatBytes(stats.totalStorageBytes)}
            delay={0}
            decimalPlaces={2}
          />
          <StatsCard
            title="Total File"
            value={stats.totalFiles}
            icon={<Files size={18} />}
            description="File tersimpan"
            delay={100}
          />
          <StatsCard
            title="Total Upload"
            value={stats.totalUploads}
            icon={<Upload size={18} />}
            description="Sesi upload"
            delay={200}
          />
          {isAdmin && "totalUsers" in stats && (
            <StatsCard
              title="Total User"
              value={(stats as { totalUsers: number }).totalUsers}
              icon={<Users size={18} />}
              description="Pengguna aktif"
              delay={300}
            />
          )}
          {!isAdmin && (
            <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" } as React.CSSProperties}>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                  Quick Action
                </p>
                <Link href="/upload">
                  <Button variant="primary" size="sm" className="w-full">
                    <Upload size={14} />
                    Upload File
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent uploads */}
          <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "200ms" } as React.CSSProperties}>
            <CardHeader>
              <CardTitle>Upload Terbaru</CardTitle>
              <Link
                href="/files"
                className="text-xs text-[hsl(var(--accent))] hover:underline"
              >
                Lihat semua
              </Link>
            </CardHeader>
            <CardContent>
              <RecentUploads
                uploads={recentUploads.map((u) => ({
                  ...u,
                  totalSize: u.totalSize.toString(),
                  createdAt: u.createdAt.toISOString(),
                  files: u.files.map((f) => ({
                    id: f.id,
                    mimeType: f.mimeType,
                    originalName: f.originalName,
                  })),
                }))}
              />
            </CardContent>
          </Card>

          {/* Storage bar */}
          <div className="space-y-4">
            <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" } as React.CSSProperties}>
              <CardHeader>
                <CardTitle>Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <StorageBar usedBytes={stats.totalStorageBytes} />
              </CardContent>
            </Card>

            {isAdmin && (
              <Link href="/upload">
                <Button variant="primary" size="lg" className="w-full">
                  <Upload size={16} />
                  Upload File Baru
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
