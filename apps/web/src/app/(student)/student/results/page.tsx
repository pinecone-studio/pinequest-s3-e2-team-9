import { RoleGuard } from "@/components/role-guard";
import { StudentPlaceholderContent } from "../../components/student-placeholder-content";
import { StudentShell } from "../../components/student-shell";

export default function StudentResultsPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <StudentShell>
        <StudentPlaceholderContent
          badge="Results"
          description="Энэ дэлгэц дээр сурагчийн үнэлгээ, оноо, шалгалт тус бүрийн гүйцэтгэлийг харуулах суурь тавигдлаа. Одоогоор UI бэлэн бөгөөд data integration дараагийн алхам байна."
          title="Үнэлгээ"
        />
      </StudentShell>
    </RoleGuard>
  );
}
