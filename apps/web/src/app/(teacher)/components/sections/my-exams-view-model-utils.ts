import {
  AttemptStatus,
  ExamStatus,
  PassingCriteriaType,
  QuestionType,
} from "@/graphql/generated";
import { getCurriculumTopicGroupName } from "../question-bank-curriculum";
import { CalendarIcon, ClipboardIcon, ClockIcon } from "../icons";
import type { ExamMetaItem, MyExamQuestionPreview, QueryExam } from "./my-exams-types";

type ExamMetaSource = {
  questions: Array<{ points: number }>;
  durationMinutes: number;
  class: { name: string };
  startedAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  status: ExamStatus;
};

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

export const getExamStatus = (status: ExamStatus) => {
  if (status === ExamStatus.Published) {
    return { label: "Явагдаж буй", tone: "border-[#EAB53233] bg-[#EAB5321A] text-[#946200]" };
  }
  if (status === ExamStatus.Closed) {
    return { label: "Дууссан", tone: "border-[#31AA4033] bg-[#31AA401A] text-[#0F7A4F]" };
  }
  return { label: "Ноорог", tone: "border-[#DFE1E5] bg-[#F2F4F7] text-[#52555B]" };
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
  status === AttemptStatus.Graded ? "Шалгасан" : status === AttemptStatus.Submitted ? "Илгээсэн" : "Явагдаж буй";

export const calculatePercent = (score: number, total: number) =>
  total > 0 ? Math.round((score / total) * 100) : 0;

export const formatScore = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export const hasPassedExam = (
  score: number,
  total: number,
  passingCriteriaType: PassingCriteriaType,
  passingThreshold: number,
) =>
  passingCriteriaType === PassingCriteriaType.Points
    ? score >= passingThreshold
    : calculatePercent(score, total) >= passingThreshold;

export const formatAnswerValue = (type: QuestionType, value: string) => {
  if (type === QuestionType.TrueFalse) {
    return value === "true" ? "Үнэн" : value === "false" ? "Худал" : value;
  }
  if (type === QuestionType.ImageUpload) {
    return value.trim() ? "Зураг оруулсан" : "Хариулт оруулаагүй";
  }
  return value.trim() || "Хариулт оруулаагүй";
};

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
  if (!correctAnswer) return null;
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
      id: item.question.id,
      order: item.order,
      prompt: item.question.prompt || item.question.title,
      topic: getCurriculumTopicGroupName(
        exam.class.grade,
        exam.class.subject,
        item.question.bank.topic || "Ерөнхий сэдэв",
      ),
      kind:
        item.question.type === QuestionType.Mcq ||
        item.question.type === QuestionType.TrueFalse
          ? "options"
          : item.question.type === QuestionType.ImageUpload
            ? "upload"
            : "text",
      options: item.question.options,
      points: item.points,
      typeLabel: getPreviewTypeLabel(item.question.type),
      correctAnswer: item.question.correctAnswer ?? null,
      answerText: getPreviewAnswerText(
        item.question.type,
        item.question.correctAnswer,
      ),
    }));

export const buildExamMeta = (exam: ExamMetaSource): ExamMetaItem[] => {
  const meta: ExamMetaItem[] = [
    { icon: ClipboardIcon, text: `${exam.questions.length} асуулт` },
    { icon: ClockIcon, text: `${exam.durationMinutes} минут` },
    { text: exam.class.name },
  ];

  if (exam.startedAt) {
    meta.push({ icon: CalendarIcon, text: `Эхэлсэн: ${formatDate(exam.startedAt)}`, tone: "text-[#52555B]" });
  }
  if (exam.endsAt) {
    meta.push({
      icon: CalendarIcon,
      text: `${exam.status === ExamStatus.Closed ? "Дууссан" : "Дуусах"}: ${formatDate(exam.endsAt)}`,
      tone: "text-[#52555B]",
    });
  }
  if (!exam.startedAt && !exam.endsAt) {
    meta.push({ icon: CalendarIcon, text: formatDate(exam.createdAt), tone: "text-[#52555B]" });
  }

  return meta;
};
