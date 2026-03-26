import { RoleGuard } from "@/components/role-guard";
import { StudentHomeContent } from "../components/student-home-content";
import { StudentShell } from "../components/student-shell";

export default function StudentPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <StudentShell>
        <StudentHomeContent />
      </StudentShell>
    </RoleGuard>
  );
}
