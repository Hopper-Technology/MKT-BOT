import { AppStoreProvider } from "@/lib/app-store";
import { DashboardShell } from "@/components/dashboard-shell";
import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AppStoreProvider>
      <DashboardShell user={session?.user ?? null}>{children}</DashboardShell>
    </AppStoreProvider>
  );
}
