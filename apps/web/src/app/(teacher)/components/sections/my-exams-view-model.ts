import { AttemptStatus, ExamStatus } from "@/graphql/generated";
import { CalendarIcon, ClipboardIcon, ClockIcon } from "../icons";
import type {
  MyExamStudentRow,
  MyExamView,
  QueryExam,
} from "./my-exams-types";
import {
  buildPreviewQuestions,
  formatDate,
  formatDateOnly,
  getAttemptLabel,
  getAttemptStatus,
  getExamStatus,
} from "./my-exams-view-model-helpers";

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
        meta: [
          { icon: ClipboardIcon, text: questionCountLabel },
          { icon: ClockIcon, text: durationLabel },
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
