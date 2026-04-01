import { CreateExamContent } from "./create-exam-content";

type CreateExamPageProps = {
  searchParams: Promise<{
    bankId?: string;
    classId?: string;
    examId?: string;
    returnTo?: string;
  }>;
};

export default async function CreateExamPage({
  searchParams,
}: CreateExamPageProps) {
  const params = await searchParams;

  return (
    <CreateExamContent
      initialBankId={params.bankId}
      initialClassId={params.classId}
      examId={params.examId}
      returnTo={params.returnTo}
    />
  );
}
