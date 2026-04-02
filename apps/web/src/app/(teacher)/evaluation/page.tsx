import { RoleGuard } from "@/components/role-guard";
import { AppShell } from "../components/app-shell";
import { EvaluationSection } from "../components/sections/evaluation-section";

export default function EvaluationPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell>
        <EvaluationSection />
      </AppShell>
    </RoleGuard>
  );
}
