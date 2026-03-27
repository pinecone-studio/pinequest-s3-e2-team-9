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
      <AppShell contentClassName="lg:px-[60px] lg:py-[54px]">
        <CreateExamContent
          initialClassId={params.classId}
          returnTo={params.returnTo}
        />
      </AppShell>
    </RoleGuard>
  );
}
