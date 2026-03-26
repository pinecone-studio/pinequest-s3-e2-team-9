import { AppShell } from "./components/app-shell";
import { DashboardContent } from "./components/dashboard-content";
import { RoleGuard } from "@/components/role-guard";

export default function Home() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell contentClassName="lg:px-[60px] lg:py-[54px]">
        <DashboardContent />
      </AppShell>
    </RoleGuard>
  );
}
