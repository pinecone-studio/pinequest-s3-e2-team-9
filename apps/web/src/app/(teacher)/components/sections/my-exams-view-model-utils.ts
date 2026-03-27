import { AttemptStatus, ExamStatus, QuestionType } from "@/graphql/generated";
import { CalendarIcon, ClipboardIcon, ClockIcon } from "../icons";
import type { ExamMetaItem, MyExamQuestionPreview, QueryExam } from "./my-exams-types";

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

export const formatAnswerValue = (type: QuestionType, value: string) => {
  if (type === QuestionType.TrueFalse) {
    return value === "true" ? "Үнэн" : value === "false" ? "Худал" : value;
  }
  return value.trim() || "Хариулт оруулаагүй";
};

export const buildPreviewQuestions = (exam: QueryExam): MyExamQuestionPreview[] =>
  [...exam.questions]
    .sort((first, second) => first.order - second.order)
    .map((item) => ({
      id: item.question.id,
      prompt: item.question.prompt || item.question.title,
      kind:
        item.question.type === QuestionType.Mcq ||
        item.question.type === QuestionType.TrueFalse
          ? "options"
          : item.question.type === QuestionType.ImageUpload
            ? "upload"
            : "text",
      options: item.question.options,
      points: item.points,
    }));

export const buildExamMeta = (exam: QueryExam): ExamMetaItem[] => {
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
