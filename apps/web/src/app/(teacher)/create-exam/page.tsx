import { AppShell } from "../components/app-shell";
import { CreateExamContent } from "./create-exam-content";
import { RoleGuard } from "@/components/role-guard";

type CreateExamPageProps = {
  searchParams: Promise<{
    classId?: string;
    returnTo?: string;
  }>;
};

export default async function CreateExamPage({
  searchParams,
}: CreateExamPageProps) {
  const params = await searchParams;

  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell contentClassName="px-6 pb-10 pt-6 sm:px-7 lg:px-8 lg:pb-12 lg:pt-8">
        <CreateExamContent
          initialClassId={params.classId}
          returnTo={params.returnTo}
        />
      </AppShell>
    </RoleGuard>
  );
}
