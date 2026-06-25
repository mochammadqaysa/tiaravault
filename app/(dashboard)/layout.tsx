import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}


import { GridPattern } from "@/components/magicui/grid-pattern";

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
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
          ]}
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 pb-20">
          <Header
            title="TiaraVault"
            userRole={user.role}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
            {children}
          </main>
        </div>
        <BottomNav userRole={user.role} />
      </div>
    </SessionProvider>
  );
}
