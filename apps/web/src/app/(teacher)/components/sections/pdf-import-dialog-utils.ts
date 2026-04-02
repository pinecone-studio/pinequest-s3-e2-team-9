import {
  QuestionType,
  type ApproveExamImportJobMutationMutation,
  type CreateExamImportJobMutationMutation,
} from "@/graphql/generated";
import type {
  PdfImportClassifier,
  PdfImportStructuredDocument,
} from "./pdf-import-normalized-document";
import { normalizeImportQuestionOptions } from "./pdf-import-dialog-editor-utils";

export type ImportQuestionView = {
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
  sourceExcerpt?: string | null;
  sourceBlockId?: string | null;
  sourceBboxJson?: string | null;
  confidence: number;
  needsReview: boolean;
};

export type ImportJobView = {
  id: string;
  title: string;
  status: string;
  totalQuestions: number;
  reviewCount: number;
  extractionDocument?: PdfImportStructuredDocument | null;
  classifier?: PdfImportClassifier | null;
  questionBank?: { id: string; title: string } | null;
  exam?: { id: string; title: string; classId: string; className: string } | null;
  questions: ImportQuestionView[];
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
) => {
  const extractionDocument = (() => {
    if (typeof job.extractionJson !== "string" || !job.extractionJson.trim()) {
      return null;
    }

    try {
      return JSON.parse(job.extractionJson) as PdfImportStructuredDocument;
    } catch {
      return null;
    }
  })();
  const classifier = (() => {
    if (typeof job.classifierJson === "string" && job.classifierJson.trim()) {
      try {
        return JSON.parse(job.classifierJson) as PdfImportClassifier;
      } catch {
        return extractionDocument?.classifier ?? null;
      }
    }

    return extractionDocument?.classifier ?? null;
  })();

  return {
    id: job.id,
    title: job.title,
    status: job.status,
    totalQuestions: job.totalQuestions,
    reviewCount: job.reviewCount,
    extractionDocument,
    classifier,
    questionBank: "questionBank" in job ? job.questionBank : null,
    exam:
      "exam" in job && job.exam
        ? {
            id: job.exam.id,
            title: job.exam.title,
            classId: job.exam.class.id,
            className: job.exam.class.name,
          }
        : null,
    questions: job.questions.map((question) => {
      const normalizedOptions = normalizeImportQuestionOptions(question.options);
      const normalizedType =
        question.type === QuestionType.ShortAnswer && normalizedOptions.length >= 2
          ? QuestionType.Mcq
          : question.type;

      return {
        id: question.id,
        order: question.order,
        type: normalizedType,
        title: question.title,
        prompt: question.prompt,
        options: normalizedOptions,
        answers: question.answers,
        score: question.score,
        difficulty: question.difficulty,
        sourcePage: question.sourcePage,
        sourceExcerpt: question.sourceExcerpt,
        sourceBlockId: question.sourceBlockId,
        sourceBboxJson: question.sourceBboxJson,
        confidence: question.confidence,
        needsReview: question.needsReview,
      };
    }),
  };
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
