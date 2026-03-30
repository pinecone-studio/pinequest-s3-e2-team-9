import { QuestionType, type ApproveExamImportJobMutationMutation, type CreateExamImportJobMutationMutation } from "@/graphql/generated";

export type ImportJobView = {
  id: string;
  title: string;
  status: string;
  totalQuestions: number;
  reviewCount: number;
  questionBank?: { id: string; title: string } | null;
  questions: Array<{
    id: string;
    order: number;
    type: QuestionType;
    title: string;
    prompt: string;
    options: string[];
    answers: string[];
    score: number;
    difficulty: string;
    sourcePage?: number | null;
    confidence: number;
    needsReview: boolean;
  }>;
};

export const questionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.Mcq]: "Олон сонголт",
  [QuestionType.TrueFalse]: "Үнэн/Худал",
  [QuestionType.ShortAnswer]: "Тоо бодолт",
  [QuestionType.Essay]: "Задгай",
  [QuestionType.ImageUpload]: "Зураг",
};

export const buildImportJobView = (
  job:
    | CreateExamImportJobMutationMutation["createExamImportJob"]
    | ApproveExamImportJobMutationMutation["approveExamImportJob"],
): ImportJobView => ({
  id: job.id,
  title: job.title,
  status: job.status,
  totalQuestions: job.totalQuestions,
  reviewCount: job.reviewCount,
  questionBank: "questionBank" in job ? job.questionBank : null,
  questions: job.questions.map((question) => ({
    id: question.id,
    order: question.order,
    type: question.type,
    title: question.title,
    prompt: question.prompt,
    options: question.options,
    answers: question.answers,
    score: question.score,
    difficulty: question.difficulty,
    sourcePage: question.sourcePage,
    confidence: question.confidence,
    needsReview: question.needsReview,
  })),
});

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
