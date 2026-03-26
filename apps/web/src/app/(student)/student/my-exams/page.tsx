import { RoleGuard } from "@/components/role-guard";
import { StudentPlaceholderContent } from "../../components/student-placeholder-content";
import { StudentShell } from "../../components/student-shell";

export default function StudentMyExamsPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <StudentShell>
        <StudentPlaceholderContent
          badge="My Exams"
          description="Энд сурагчийн өгөх, эхэлсэн, дууссан шалгалтууд жагсаж харагдана. Navigation болон route нь бэлэн болсон тул дараагийн алхамд бодит exam data холбоход амархан."
          title="Миний шалгалтууд"
        />
      </StudentShell>
    </RoleGuard>
  );
}
