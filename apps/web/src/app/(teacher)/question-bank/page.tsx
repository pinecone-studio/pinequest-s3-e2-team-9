import { QuestionBankSection } from "../components/sections/question-bank-section";
import { Sidebar } from "../components/sidebar";
import { RoleGuard } from "@/components/role-guard";

export default function QuestionBankPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
          <Sidebar />
          <section className="flex-1 overflow-y-auto">
            <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-[60px] lg:py-[54px]">
              <QuestionBankSection />
            </div>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
