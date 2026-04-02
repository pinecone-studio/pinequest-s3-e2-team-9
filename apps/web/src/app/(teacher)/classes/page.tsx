import { AppShell } from "../components/app-shell";
import { ClassesPageContent } from "./classes-page-content";
import { RoleGuard } from "@/components/role-guard";

export default function ClassesPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell
        fixedHeight
        contentOuterClassName="w-full"
        contentInnerClassName="w-[1184px]"
        contentClassName="px-0 py-0"
      >
        <ClassesPageContent />
      </AppShell>
    </RoleGuard>
  );
}
