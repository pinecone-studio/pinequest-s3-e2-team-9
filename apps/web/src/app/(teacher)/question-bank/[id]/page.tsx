import { QuestionBankDetailView } from "../../components/sections/question-bank-detail-view";

type QuestionBankDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionBankDetailPage({
  params,
}: QuestionBankDetailPageProps) {
  const { id } = await params;

  return <QuestionBankDetailView bankId={id} />;
}
