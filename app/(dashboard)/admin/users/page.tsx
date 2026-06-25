"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Shield, Trash2, RefreshCw, Crown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatBytes, formatRelativeDate } from "@/lib/fileUtils";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  uploadCount: number;
  fileCount: number;
  storageBytes: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Hapus user "${userName}"? Semua file mereka juga akan dihapus.`)) return;
    setDeletingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchUsers();
    } finally {
      setDeletingId(null);
    }
  };

  const totalStorage = users.reduce(
    (s, u) => s + BigInt(u.storageBytes || 0), BigInt(0)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent-muted)/0.5)] flex items-center justify-center">
            <Users size={18} className="text-[hsl(var(--accent))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
              Manajemen User
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
              {users.length} user · Total {formatBytes(totalStorage)} digunakan
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className="animate-fade-in-up hover:ring-[hsl(var(--accent)/0.3)] transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(280_80%_65%)] flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">
                      {user.name}
                    </p>
                    {user.role === "ADMIN" && (
                      <Badge variant="info">
                        <Crown size={10} />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] truncate">
                    {user.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-xs text-[hsl(var(--text-secondary))]">
                  <div className="text-center">
                    <p className="font-semibold text-[hsl(var(--text-primary))] text-sm">
                      {user.fileCount}
                    </p>
                    <p>Files</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[hsl(var(--text-primary))] text-sm">
                      {formatBytes(BigInt(user.storageBytes || 0))}
                    </p>
                    <p>Storage</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[hsl(var(--text-primary))] text-sm">
                      {formatRelativeDate(new Date(user.createdAt))}
                    </p>
                    <p>Bergabung</p>
                  </div>
                </div>

                {/* Role badge */}
                <Badge variant={user.role === "ADMIN" ? "info" : "default"}>
                  {user.role}
                </Badge>

                {/* Delete */}
                {user.role !== "ADMIN" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id, user.name)}
                    loading={deletingId === user.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
