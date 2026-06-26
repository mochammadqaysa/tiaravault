import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";
import LightPillar from "@/components/reactbits/LightPillar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))] relative">
        <div className="absolute inset-0 z-0 opacity-50">
          <LightPillar
            topColor="#ffffff"
            bottomColor="#0070E0"
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="TiaraVault"
            userRole={user.role}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-24 bg-transparent relative z-10">
            {children}
          </main>
        </div>
        <BottomNav userRole={user.role} />
      </div>
    </SessionProvider>
  );
}
