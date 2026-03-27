import { AttemptStatus, ExamStatus, QuestionType } from "@/graphql/generated";
import type {
  MyExamQuestionPreview,
  MyExamStudentAnswer,
  MyExamStudentRow,
  MyExamView,
  QueryExam,
} from "./my-exams-types";
import {
  buildExamMeta,
  calculatePercent,
  formatAnswerValue,
  formatDate,
  getAttemptLabel,
  getAttemptStatus,
  getExamStatus,
} from "./my-exams-view-model-utils";
import { formatDateOnly } from "./my-exams-view-model-helpers";

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

const buildPreviewQuestions = (exam: QueryExam): MyExamQuestionPreview[] =>
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
      points: item.points,
      typeLabel: getPreviewTypeLabel(item.question.type),
      options: item.question.options,
      correctAnswer: item.question.correctAnswer ?? null,
      answerText: getPreviewAnswerText(
        item.question.type,
        item.question.correctAnswer,
      ),
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
      const questionCountLabel = `${exam.questions.length} асуулт`;
      const durationLabel = `${exam.durationMinutes} минут`;
      const totalPointsLabel = `${totalPoints} оноо`;
      const submittedAttempts = exam.attempts.filter(
        (attempt) => attempt.status !== AttemptStatus.InProgress,
      );
      const questionOrderMap = new Map(
        exam.questions.map((item) => [item.question.id, item.order]),
      );
      const questionPointsMap = new Map(
        exam.questions.map((item) => [item.question.id, item.points]),
      );

      const studentRows: MyExamStudentRow[] = exam.attempts.map((attempt) => {
        const answers: MyExamStudentAnswer[] = [...attempt.answers]
          .sort(
            (first, second) =>
              (questionOrderMap.get(first.question.id) ?? Number.MAX_SAFE_INTEGER) -
              (questionOrderMap.get(second.question.id) ?? Number.MAX_SAFE_INTEGER),
          )
          .map((answer) => ({
            id: answer.id,
            questionId: answer.question.id,
            prompt: answer.question.prompt || answer.question.title,
            value: formatAnswerValue(answer.question.type, answer.value),
            type: answer.question.type,
            score: (answer.autoScore ?? 0) + (answer.manualScore ?? 0),
            total: questionPointsMap.get(answer.question.id) ?? 0,
            feedback: answer.feedback ?? null,
            submitted: formatDate(answer.createdAt),
          }));

        return {
          id: attempt.id,
          name: attempt.student.fullName,
          subject: exam.class.name,
          score: attempt.totalScore,
          total: totalPoints,
          percent: calculatePercent(attempt.totalScore, totalPoints),
          statusLabel: getAttemptLabel(attempt.status),
          statusTone: getAttemptStatus(attempt.status),
          submitted: formatDate(attempt.submittedAt ?? attempt.startedAt),
          answers,
        };
      });

      const passed = submittedAttempts.filter(
        (attempt) => calculatePercent(attempt.totalScore, totalPoints) >= 60,
      ).length;

      const average = submittedAttempts.length
        ? Math.round(
            (submittedAttempts.reduce((sum, attempt) => sum + attempt.totalScore, 0) /
              submittedAttempts.length /
              Math.max(totalPoints, 1)) *
              100,
          )
        : 0;

      const footer =
        exam.status === ExamStatus.Closed
          ? {
              type: "summary" as const,
              students: totalStudents,
              submitted: submittedAttempts.length,
              passRate: submittedAttempts.length
                ? Math.round((passed / submittedAttempts.length) * 100)
                : 0,
              passed,
              failed: Math.max(submittedAttempts.length - passed, 0),
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
        subjectName: exam.class.subject,
        createdDateLabel: formatDateOnly(exam.createdAt),
        questionCount: exam.questions.length,
        totalPoints,
        secondaryLabel:
          exam.status === ExamStatus.Draft
            ? "Хувийн сан"
            : `${getExamStatus(exam.status).label} • ${submittedAttempts.length}/${totalStudents} илгээсэн`,
        questionCountLabel,
        durationLabel,
        totalPointsLabel,
        status: getExamStatus(exam.status),
        meta: buildExamMeta(exam),
        actions: { view: true, results: exam.attempts.length > 0 },
        footer,
        highlight: exam.status === ExamStatus.Published,
        previewQuestions: buildPreviewQuestions(exam),
        students: studentRows,
      };
    });
