"use client";

import { Bell, Search, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  title: string;
  subtitle?: string;
  userRole?: string;
}

import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";


export function Header({ title, subtitle, userRole }: HeaderProps) {
  return (
    <header className="h-[52px] sticky top-0 z-30 bg-[hsl(var(--surface))/0.8] backdrop-blur-md">
      <div className="flex items-center justify-between px-4 md:px-8 w-full h-full">
        <div className="truncate pr-2">
          <h2 className="text-[18px] md:text-[21px] font-semibold tracking-[0.231px] text-[hsl(var(--text-primary))] truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px] md:text-[13px] font-normal tracking-tight text-[hsl(var(--text-secondary))] mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]"
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-[36px] pr-4 py-[6px] text-[14px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-full text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-secondary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))] w-48 lg:w-64 transition-all h-[36px]"
            />
          </div>

          {/* Role badge */}
          {userRole === "ADMIN" && (
            <Badge variant="info" className="hidden sm:flex rounded-full text-[12px]">
              Admin
            </Badge>
          )}

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors flex items-center justify-center">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[hsl(var(--accent))] ring-2 ring-[hsl(var(--surface))]" />
          </button>

          {/* Theme toggler */}
          <div className="relative">
            <AnimatedThemeToggler 
              variant="circle"
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] bg-[hsl(var(--background))] border border-[hsl(var(--border))] transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
