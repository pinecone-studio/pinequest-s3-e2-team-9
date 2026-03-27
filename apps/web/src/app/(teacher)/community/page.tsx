import { RoleGuard } from "@/components/role-guard";
import { AppShell } from "../components/app-shell";
import { CommunitySection } from "../components/sections/community-section";

export default function CommunityPage() {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell>
        <CommunitySection />
      </AppShell>
    </RoleGuard>
  );
}
