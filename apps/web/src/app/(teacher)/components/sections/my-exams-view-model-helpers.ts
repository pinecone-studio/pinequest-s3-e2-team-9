import {
  AttemptStatus,
  ExamStatus,
  QuestionType,
} from "@/graphql/generated";
import type { MyExamQuestionPreview, QueryExam } from "./my-exams-types";

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "Хугацаа байхгүй";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("mn-MN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const formatDateOnly = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.split("T")[0] ?? value;
  }
  return date.toISOString().slice(0, 10);
};

export const getExamStatus = (status: ExamStatus) => {
  if (status === ExamStatus.Published) {
    return {
      label: "Явагдаж буй",
      tone: "border-[#EAB53233] bg-[#EAB5321A] text-[#946200]",
    };
  }
  if (status === ExamStatus.Closed) {
    return {
      label: "Дууссан",
      tone: "border-[#31AA4033] bg-[#31AA401A] text-[#0F7A4F]",
    };
  }
  return {
    label: "Ноорог",
    tone: "border-[#DFE1E5] bg-[#F2F4F7] text-[#52555B]",
  };
};

export const getAttemptStatus = (status: AttemptStatus) => {
  if (status === AttemptStatus.Graded) {
    return "border-[#31AA4033] bg-[#31AA401A] text-[#31AA40]";
  }
  if (status === AttemptStatus.Submitted) {
    return "border-[#F63D6B33] bg-[#F63D6B1A] text-[#F63D6B]";
  }
  return "border-[#DFE1E5] bg-[#F0F2F5] text-[#52555B]";
};

export const getAttemptLabel = (status: AttemptStatus) =>
  status === AttemptStatus.Graded
    ? "Шалгасан"
    : status === AttemptStatus.Submitted
      ? "Илгээсэн"
      : "Явагдаж буй";

const getPreviewTypeLabel = (type: QuestionType) => {
  if (type === QuestionType.ShortAnswer) return "Тоон";
  if (type === QuestionType.Essay) return "Эссе";
  if (type === QuestionType.ImageUpload) return "Зураг";
  return "Сонгох";
};

const getPreviewAnswerText = (
  type: QuestionType,
  correctAnswer: string | null | undefined,
) => {
  if (!correctAnswer) {
    return null;
  }
  if (type === QuestionType.TrueFalse) {
    return `Зөв хариулт: ${correctAnswer === "True" ? "Үнэн" : "Худал"}`;
  }
  if (type === QuestionType.ShortAnswer) {
    return `Зөв хариулт: ${correctAnswer}`;
  }
  if (type === QuestionType.Essay) {
    return `Жишиг хариулт: ${correctAnswer}`;
  }
  if (type === QuestionType.ImageUpload) {
    return "Зургийн тайлбар шаардлагатай.";
  }
  return null;
};

export const buildPreviewQuestions = (exam: QueryExam): MyExamQuestionPreview[] =>
  [...exam.questions]
    .sort((first, second) => first.order - second.order)
    .map((item) => ({
      id: item.id,
      prompt: item.question.prompt || item.question.title,
      kind:
        item.question.type === QuestionType.Mcq ||
        item.question.type === QuestionType.TrueFalse
          ? "options"
          : item.question.type === QuestionType.ImageUpload
            ? "upload"
            : "text",
      points: item.points,
      typeLabel: getPreviewTypeLabel(item.question.type),
      options: item.question.options,
      correctAnswer: item.question.correctAnswer ?? null,
      answerText: getPreviewAnswerText(
        item.question.type,
        item.question.correctAnswer,
      ),
    }));
