import {
  AttemptStatus,
  ExamStatus,
  QuestionType,
} from "@/graphql/generated";
import { CalendarIcon, ClipboardIcon, ClockIcon } from "../icons";
import type {
  MyExamQuestionPreview,
  MyExamStudentRow,
  MyExamView,
  QueryExam,
} from "./my-exams-types";

const formatDate = (value: string | null | undefined) => {
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

const getExamStatus = (status: ExamStatus) => {
  if (status === ExamStatus.Published) {
    return {
      label: "Нийтлэгдсэн",
      tone: "border-[#31AA4033] bg-[#31AA401A] text-[#31AA40]",
    };
  }
  if (status === ExamStatus.Closed) {
    return {
      label: "Дууссан",
      tone: "border-[#19223033] bg-[#1922301A] text-[#192230]",
    };
  }
  return {
    label: "Ноорог",
    tone: "border-[#DFE1E5] bg-[#F0F2F5] text-[#52555B]",
  };
};

const getAttemptStatus = (status: AttemptStatus) => {
  if (status === AttemptStatus.Graded) {
    return "border-[#31AA4033] bg-[#31AA401A] text-[#31AA40]";
  }
  if (status === AttemptStatus.Submitted) {
    return "border-[#F63D6B33] bg-[#F63D6B1A] text-[#F63D6B]";
  }
  return "border-[#DFE1E5] bg-[#F0F2F5] text-[#52555B]";
};

const getAttemptLabel = (status: AttemptStatus) =>
  status === AttemptStatus.Graded
    ? "Шалгасан"
    : status === AttemptStatus.Submitted
      ? "Илгээсэн"
      : "Явагдаж буй";

const buildPreviewQuestions = (exam: QueryExam): MyExamQuestionPreview[] =>
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
      options: item.question.options,
    }));

export const buildMyExamViews = (exams: QueryExam[]): MyExamView[] =>
  [...exams]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .map((exam) => {
      const totalStudents = exam.class.students.length;
      const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
      const submittedAttempts = exam.attempts.filter(
        (attempt) => attempt.status !== AttemptStatus.InProgress,
      );
      const gradedAttempts = exam.attempts.filter(
        (attempt) => attempt.status === AttemptStatus.Graded,
      );
      const studentRows: MyExamStudentRow[] = exam.attempts.map((attempt) => {
        const percent = totalPoints > 0 ? Math.round((attempt.totalScore / totalPoints) * 100) : 0;
        return {
          id: attempt.id,
          name: attempt.student.fullName,
          subject: exam.class.name,
          score: attempt.totalScore,
          total: totalPoints,
          percent,
          statusLabel: getAttemptLabel(attempt.status),
          statusTone: getAttemptStatus(attempt.status),
          submitted: formatDate(attempt.submittedAt ?? attempt.startedAt),
        };
      });
      const passed = gradedAttempts.filter((attempt) => {
        const percent = totalPoints > 0 ? (attempt.totalScore / totalPoints) * 100 : 0;
        return percent >= 60;
      }).length;
      const average = gradedAttempts.length
        ? Math.round(
            gradedAttempts.reduce((sum, attempt) => sum + attempt.totalScore, 0) /
              gradedAttempts.length /
              Math.max(totalPoints, 1) *
              100,
          )
        : 0;
      const footer =
        exam.status === ExamStatus.Closed
          ? {
              type: "summary" as const,
              students: totalStudents,
              submitted: submittedAttempts.length,
              passRate: gradedAttempts.length ? Math.round((passed / gradedAttempts.length) * 100) : 0,
              passed,
              failed: Math.max(gradedAttempts.length - passed, 0),
              average,
            }
          : {
              type: "counts" as const,
              students: totalStudents,
              submitted: submittedAttempts.length,
            };

      return {
        id: exam.id,
        title: exam.title,
        subject: exam.class.name,
        status: getExamStatus(exam.status),
        meta: [
          { icon: ClipboardIcon, text: `${exam.questions.length} асуулт` },
          { icon: ClockIcon, text: `${exam.durationMinutes} минут` },
          { text: exam.class.name },
          { icon: CalendarIcon, text: formatDate(exam.createdAt), tone: "text-[#52555B]" },
        ],
        actions: { view: true, results: exam.attempts.length > 0 },
        footer,
        highlight: exam.status === ExamStatus.Published,
        previewQuestions: buildPreviewQuestions(exam),
        students: studentRows,
      };
    });
