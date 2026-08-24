"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Trash2, RefreshCw, Crown, UserPlus, Edit3, Key, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatBytes, formatRelativeDate } from "@/lib/fileUtils";

interface UserData {
  id: string;
  name: string;
  username: string;
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

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Form states
  const [addName, setAddName] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<"USER" | "ADMIN">("USER");

  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"USER" | "ADMIN">("USER");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!addName || !addUsername || !addPassword) {
      setErrorMsg("Nama, username, dan password wajib diisi");
      return;
    }
    if (addUsername.length < 3) {
      setErrorMsg("Username minimal 3 karakter");
      return;
    }
    if (addPassword.length < 6) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName,
          username: addUsername,
          email: addEmail,
          password: addPassword,
          role: addRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal membuat user");
        return;
      }

      setIsAddOpen(false);
      setAddName("");
      setAddUsername("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("USER");
      fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit User
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditEmail(user.email || "");
    setEditRole(user.role);
    setErrorMsg("");
    setIsEditOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    if (!editName || !editUsername) {
      setErrorMsg("Nama dan username wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: editName,
          username: editUsername,
          email: editEmail,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memperbarui user");
        return;
      }

      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Change Password
  const openPasswordModal = (user: UserData) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setIsPasswordOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    if (!newPassword) {
      setErrorMsg("Password baru wajib diisi");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengubah password");
        return;
      }

      setIsPasswordOpen(false);
      setSelectedUser(null);
      alert("Password berhasil diubah");
    } finally {
      setSubmitting(false);
    }
  };

  const totalStorage = users.reduce(
    (s: bigint, u: UserData) => s + BigInt(u.storageBytes || 0), BigInt(0)
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
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setErrorMsg("");
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            Tambah User
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
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
                    <span className="text-xs text-[hsl(var(--accent))] font-medium">
                      @{user.username}
                    </span>
                    {user.role === "ADMIN" && (
                      <Badge variant="info">
                        <Crown size={10} />
                        Admin
                      </Badge>
                    )}
                  </div>
                  {user.email && (
                    <p className="text-xs text-[hsl(var(--text-secondary))] truncate">
                      {user.email}
                    </p>
                  )}
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

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(user)}
                    title="Edit Profil"
                    className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  >
                    <Edit3 size={14} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPasswordModal(user)}
                    title="Ubah Password"
                    className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  >
                    <Key size={14} />
                  </Button>

                  {user.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id, user.name)}
                      loading={deletingId === user.id}
                      title="Hapus User"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah User */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah User Baru"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Contoh: John Doe"
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Username (untuk Login)
            </label>
            <input
              type="text"
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              placeholder="johndoe"
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
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
              Role
            </label>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as "USER" | "ADMIN")}
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
            >
              <option value="USER">User biasa (USER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Simpan User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Profil User */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Profil - ${selectedUser?.name}`}
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Username
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
              Role
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as "USER" | "ADMIN")}
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
            >
              <option value="USER">User biasa (USER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Update Profil
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ubah Password */}
      <Modal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        title={`Ubah Password - ${selectedUser?.name}`}
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {errorMsg}
            </div>
          )}

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
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
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
              className="w-full px-3.5 py-2.5 text-sm bg-[hsl(var(--surface-2))] dark:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] transition-all"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPasswordOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Ubah Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


