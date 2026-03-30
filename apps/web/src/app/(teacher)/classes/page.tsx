import { AppShell } from "../components/app-shell";
import { ClassesPageContent } from "./classes-page-content";
import { RoleGuard } from "@/components/role-guard";

export default function ClassesPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell contentClassName="!px-0 !py-0 sm:!px-0 sm:!py-0 lg:!px-0 lg:!py-0">
        <ClassesPageContent />
      </AppShell>
    </RoleGuard>
  );
}
