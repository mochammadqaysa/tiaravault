"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Shield,
  Users,
  HardDrive,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/files", icon: FolderOpen, label: "Files" },
];

const adminItems = [
  { href: "/admin", icon: Shield, label: "Admin Files" },
  { href: "/admin/users", icon: Users, label: "Manage Users" },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}


export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[hsl(var(--surface))] border-r border-[hsl(var(--border))]">
      <div className="flex flex-col h-full w-full">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center justify-center">
              <HardDrive size={18} className="text-[hsl(var(--text-primary))]" />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight text-[hsl(var(--text-primary))]">TiaraVault</h1>
              <p className="text-[12px] font-normal tracking-tight text-[hsl(var(--text-secondary))]">
                Secure Backup
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-[12px] font-medium text-[hsl(var(--text-secondary))] tracking-tight px-3 mb-3">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-[8px] text-[14px] font-normal transition-all duration-200 group",
                  isActive
                    ? "bg-[hsl(var(--background))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] shadow-sm"
                    : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--background))]"
                )}
              >
                <item.icon
                  size={16}
                  className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    isActive
                      ? "text-[hsl(var(--text-primary))]"
                      : "text-[hsl(var(--text-secondary))]"
                  )}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p className="text-[12px] font-medium text-[hsl(var(--text-secondary))] tracking-tight px-3 mb-3 mt-6">
                Admin
              </p>
              {adminItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-[8px] text-[14px] font-normal transition-all duration-200 group",
                      isActive
                        ? "bg-[hsl(var(--background))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] shadow-sm"
                        : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--background))]"
                    )}
                  >
                    <item.icon
                      size={16}
                      className={cn(
                        "flex-shrink-0 transition-transform duration-200",
                        isActive
                          ? "text-[hsl(var(--text-primary))]"
                          : "text-[hsl(var(--text-secondary))]"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-[hsl(var(--border))] mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--text-primary))] text-[12px] font-semibold flex-shrink-0">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium tracking-tight text-[hsl(var(--text-primary))] truncate">
                {userName}
              </p>
              <p className="text-[12px] tracking-tight text-[hsl(var(--text-secondary))] truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-[14px] font-normal text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--background))] transition-all duration-200 group"
          >
            <LogOut
              size={16}
              className="flex-shrink-0"
            />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
