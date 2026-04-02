import { RoleGuard } from "@/components/role-guard";
import { StudentSelfTestsContent } from "../../components/student-self-tests-content";
import { StudentShell } from "../../components/student-shell";

export default function StudentMyExamsPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <StudentShell>
        <StudentSelfTestsContent />
      </StudentShell>
    </RoleGuard>
  );
}
