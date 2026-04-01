import { ClassDetailPageContent } from "./class-detail-page-content";

type ClassDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const { id } = await params;

  return <ClassDetailPageContent id={id} />;
}
