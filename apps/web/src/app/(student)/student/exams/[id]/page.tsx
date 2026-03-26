import { RoleGuard } from "@/components/role-guard";
import { StudentExamRoom } from "../../../components/student-exam-room";
import { StudentShell } from "../../../components/student-shell";

type StudentExamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentExamPage({
  params,
}: StudentExamPageProps) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <StudentShell>
        <StudentExamRoom examId={id} />
      </StudentShell>
    </RoleGuard>
  );
}
