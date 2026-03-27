import { AppShell } from "../components/app-shell";
import { QuestionBankSection } from "../components/sections/question-bank-section";
import { RoleGuard } from "@/components/role-guard";

export default function QuestionBankPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell contentClassName="lg:px-[60px] lg:py-[54px]">
        <QuestionBankSection />
      </AppShell>
    </RoleGuard>
  );
}
