import { AppShell } from "./components/app-shell";
import { DashboardContent } from "./components/dashboard-content";
import { RoleGuard } from "@/components/role-guard";

export default function Home() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell
        fixedHeight
        contentOuterClassName="w-full"
        contentInnerClassName="w-[1184px]"
        contentClassName="px-0 py-0"
      >
        <DashboardContent />
      </AppShell>
    </RoleGuard>
  );
}
