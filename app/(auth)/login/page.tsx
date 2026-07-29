"use client";

import { useState, useActionState } from "react";
import { loginAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { HardDrive, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import SideRays from "@/components/reactbits/SideRays";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Side Rays background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <SideRays
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          speed={4.2}
          intensity={3.0}
          spread={3.0}
          tilt={60.0}
          saturation={1.5}
          blend={0.75}
          falloff={0.9}
          opacity={1.0}
        />
      </div>

      {/* Card (Apple Tile) */}
      <div className="relative w-full max-w-[400px]">
        <div className="bg-[hsl(var(--background))] rounded-[18px] border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <div className="relative p-10 w-full">
            {/* Logo */}
            <div className="flex flex-col items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[16px] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] flex items-center justify-center">
                <HardDrive size={28} className="text-[hsl(var(--text-primary))]" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-[28px] font-semibold tracking-[-0.01em] text-[hsl(var(--text-primary))]">
                  TiaraVault
                </h1>
                <p className="text-[15px] font-normal tracking-[-0.01em] text-[hsl(var(--text-secondary))]">
                  Sign in to your account
                </p>
              </div>
            </div>

            {/* Error alert */}
            {state?.error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[8px] bg-[hsl(var(--destructive))/0.1] text-[hsl(var(--destructive))] text-[14px] font-normal mb-6 border border-[hsl(var(--destructive))/0.2]">
                <AlertCircle size={16} className="flex-shrink-0" />
                {state.error}
              </div>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="redirectTo" value="/dashboard" />
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="username"
                    defaultValue=""
                    placeholder="Username"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full px-4 py-3.5 text-[17px] bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-[14px] text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-secondary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    defaultValue=""
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3.5 text-[17px] bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-[14px] text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-secondary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-hover))] transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-14 rounded-[9999px] font-medium text-[17px] bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] active:scale-[0.95] transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? "Signing in..." : "Continue"}
                  {!isPending && <ArrowRight size={18} />}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[hsl(var(--border))] text-center">
              <p className="text-[12px] font-normal tracking-tight text-[hsl(var(--text-secondary))]">
                TiaraVault Secure Storage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
