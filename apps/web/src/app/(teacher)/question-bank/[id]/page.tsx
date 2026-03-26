import { QuestionBankDetailView } from "../../components/sections/question-bank-detail-view";
import { Sidebar } from "../../components/sidebar";
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
      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
          <Sidebar />
          <section className="flex-1 overflow-y-auto">
            <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-[60px] lg:py-[54px]">
              <QuestionBankDetailView bankId={id} />
            </div>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
