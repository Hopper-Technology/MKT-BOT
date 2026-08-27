import { AppStoreProvider } from "@/lib/app-store";
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppStoreProvider>
  );
}
