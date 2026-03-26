import { AppShell } from "../components/app-shell";
import { ClassesPageContent } from "./classes-page-content";
import { RoleGuard } from "@/components/role-guard";

export default function ClassesPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell>
        <ClassesPageContent />
      </AppShell>
    </RoleGuard>
  );
}
