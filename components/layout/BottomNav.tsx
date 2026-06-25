"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Shield,
  Users,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/files", icon: FolderOpen, label: "Files" },
];

const adminItems = [
  { href: "/admin", icon: Shield, label: "Admin" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

interface BottomNavProps {
  userRole?: string;
}

import GlassSurface from "@/components/reactbits/GlassSurface";

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={9999}
        blur={24}
        opacity={0.6}
        brightness={50}
        backgroundOpacity={0.02}
        className="shadow-[0_8px_32px_rgba(0,0,0,0.1)] ring-1 ring-[hsl(var(--border))/0.1]"
      >
        <nav className="flex items-center gap-1 px-2 py-2 relative z-10">
          {allItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-[hsl(var(--accent))] text-white shadow-[0_0_16px_hsl(var(--accent)/0.3)]"
                    : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-2))/0.5]"
                )}
              >
                <item.icon size={20} className={cn("transition-transform duration-300", isActive && "scale-110")} />
              </Link>
            );
          })}
          
          <div className="w-px h-8 bg-[hsl(var(--border))] mx-1" />
          
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))/0.1] transition-all duration-300"
          >
            <LogOut size={20} />
          </button>
        </nav>
      </GlassSurface>
    </div>
  );
}
