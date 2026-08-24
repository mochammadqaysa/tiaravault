"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Key, Save, Lock, Shield, HardDrive, FileText, Calendar, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatBytes, formatRelativeDate } from "@/lib/fileUtils";

interface ProfileData {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  uploadCount: number;
  fileCount: number;
  storageBytes: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
          setUsername(data.user.username);
          setEmail(data.user.email || "");
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!name || !username) {
      setProfileMsg({ type: "error", text: "Nama dan username wajib diisi" });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error || "Gagal memperbarui profil" });
        return;
      }

      setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
      fetchProfile();
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!oldPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Password lama dan password baru wajib diisi" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error || "Gagal mengubah password" });
        return;
      }

      setPasswordMsg({ type: "success", text: "Password berhasil diperbarui!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header Profile Card */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--surface-2)/0.6)] border-0 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(280_80%_65%)] flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
            {profile?.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
                {profile?.name}
              </h1>
              <span className="text-sm font-medium text-[hsl(var(--accent))]">
                @{profile?.username}
              </span>
              <Badge variant={profile?.role === "ADMIN" ? "info" : "default"}>
                {profile?.role}
              </Badge>
            </div>
            {profile?.email && (
              <p className="text-sm text-[hsl(var(--text-secondary))]">{profile.email}</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2 text-xs text-[hsl(var(--text-secondary))]">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-[hsl(var(--accent))]" />
                <span>{profile?.fileCount || 0} File</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive size={14} className="text-[hsl(var(--accent))]" />
                <span>{formatBytes(BigInt(profile?.storageBytes || 0))} Terpakai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[hsl(var(--accent))]" />
                <span>Bergabung {profile ? formatRelativeDate(new Date(profile.createdAt)) : "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Edit Profil */}
        <Card className="p-6 space-y-4 border-0 shadow-lg">
          <div className="flex items-center gap-2 pb-2">
            <User size={18} className="text-[hsl(var(--accent))]" />
            <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
              Edit Profil Saya
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileMsg && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {profileMsg.type === "success" && <CheckCircle size={14} />}
                {profileMsg.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className="w-full px-3 py-2 text-sm bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
                Email (Opsional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={savingProfile} className="w-full flex items-center justify-center gap-2">
                <Save size={14} />
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>

        {/* Form Ubah Password */}
        <Card className="p-6 space-y-4 border-0 shadow-lg">
          <div className="flex items-center gap-2 pb-2">
            <Key size={18} className="text-[hsl(var(--accent))]" />
            <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
              Ubah Password Saya
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordMsg && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {passwordMsg.type === "success" && <CheckCircle size={14} />}
                {passwordMsg.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
                Password Saat Ini
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama Anda"
                className="w-full px-3 py-2 text-sm bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 pr-10 text-sm bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3 py-2 text-sm bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={savingPassword} className="w-full flex items-center justify-center gap-2">
                <Lock size={14} />
                Ubah Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
