import { AppShell } from "../../components/app-shell";
import { QuestionBankDetailView } from "../../components/sections/question-bank-detail-view";
import { RoleGuard } from "@/components/role-guard";

type QuestionBankDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionBankDetailPage({
  params,
}: QuestionBankDetailPageProps) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell contentClassName="lg:px-[60px] lg:py-[54px]">
        <QuestionBankDetailView bankId={id} />
      </AppShell>
    </RoleGuard>
  );
}
