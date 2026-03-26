import { AppShell } from "../components/app-shell";
import { MyExamsSection } from "../components/sections/my-exams-section";
import { RoleGuard } from "@/components/role-guard";

export default function MyExamsPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell>
        <MyExamsSection />
      </AppShell>
    </RoleGuard>
  );
}
