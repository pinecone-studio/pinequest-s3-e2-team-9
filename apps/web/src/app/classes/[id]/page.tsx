import { AppShell } from "@/app/components/app-shell";
import { ClassDetailPageContent } from "./class-detail-page-content";

type ClassDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <ClassDetailPageContent id={id} />
    </AppShell>
  );
}
