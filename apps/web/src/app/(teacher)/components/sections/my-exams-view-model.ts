import { AttemptStatus, ExamStatus } from "@/graphql/generated";
import type { MyExamStudentAnswer, MyExamStudentRow, MyExamView, QueryExam } from "./my-exams-types";
import { buildExamMeta, buildPreviewQuestions, calculatePercent, formatAnswerValue, formatDate, getAttemptLabel, getAttemptStatus, getExamStatus } from "./my-exams-view-model-utils";

export const buildMyExamViews = (exams: QueryExam[]): MyExamView[] =>
  [...exams]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .map((exam) => {
      const totalStudents = exam.class.students.length;
      const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
      const questionOrderMap = new Map(exam.questions.map((item) => [item.question.id, item.order]));
      const questionPointsMap = new Map(exam.questions.map((item) => [item.question.id, item.points]));
      const completedAttempts = exam.attempts.filter(
        (attempt) => attempt.status !== AttemptStatus.InProgress,
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
        const percent = calculatePercent(attempt.totalScore, totalPoints);
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
          answers,
        };
      });
      const passed = completedAttempts.filter(
        (attempt) => calculatePercent(attempt.totalScore, totalPoints) >= 60,
      ).length;
      const average = completedAttempts.length
        ? Math.round(
            completedAttempts.reduce((sum, attempt) => sum + attempt.totalScore, 0) /
              completedAttempts.length /
              Math.max(totalPoints, 1) *
              100,
          )
        : 0;
      const footer =
        exam.status === ExamStatus.Closed
          ? {
              type: "summary" as const,
              students: totalStudents,
              submitted: completedAttempts.length,
              passRate: completedAttempts.length ? Math.round((passed / completedAttempts.length) * 100) : 0,
              passed,
              failed: Math.max(completedAttempts.length - passed, 0),
              average,
            }
          : {
              type: "counts" as const,
              students: totalStudents,
              submitted: completedAttempts.length,
            };

      return {
        id: exam.id,
        title: exam.title,
        subject: exam.class.name,
        status: getExamStatus(exam.status),
        meta: buildExamMeta(exam),
        actions: { view: true, results: exam.attempts.length > 0 },
        footer,
        highlight: exam.status === ExamStatus.Published,
        previewQuestions: buildPreviewQuestions(exam),
        students: studentRows,
      };
    });
