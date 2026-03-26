import { AppShell } from "../../components/app-shell";
import { ClassDetailPageContent } from "./class-detail-page-content";
import { RoleGuard } from "@/components/role-guard";

type ClassDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <AppShell>
        <ClassDetailPageContent id={id} />
      </AppShell>
    </RoleGuard>
  );
}
