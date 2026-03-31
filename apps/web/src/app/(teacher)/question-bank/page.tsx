import { AppShell } from "../components/app-shell";
import { QuestionBankSection } from "../components/sections/question-bank-section";
import { RoleGuard } from "@/components/role-guard";

export default function QuestionBankPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell contentClassName="px-0 py-0 sm:px-0 sm:py-0 lg:px-0 lg:py-0">
        <QuestionBankSection />
      </AppShell>
    </RoleGuard>
  );
}
