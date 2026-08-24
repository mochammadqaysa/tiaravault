import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";

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
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--text-primary))] antialiased">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="TiaraVault"
            userRole={user.role}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-24">
            {children}
          </main>
        </div>
        <BottomNav userRole={user.role} />
      </div>
    </SessionProvider>
  );
}
