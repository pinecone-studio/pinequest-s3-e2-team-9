/* eslint-disable max-lines */
import { AttemptStatus, ExamStatus, QuestionType } from "@/graphql/generated";
import { getCurriculumTopicGroupName } from "../question-bank-curriculum";
import type {
  MyExamListView,
  MyExamQuestionPreview,
  MyExamStudentAnswer,
  MyExamStudentRow,
  MyExamView,
  QueryExamDetail,
  QueryExamList,
} from "./my-exams-types";
import {
  buildExamMeta,
  calculatePercent,
  formatAnswerValue,
  formatDate,
  getAttemptLabel,
  getAttemptStatus,
  getExamStatus,
  hasPassedExam,
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

const buildPreviewQuestions = (exam: QueryExamDetail): MyExamQuestionPreview[] =>
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
      points: item.points,
      typeLabel: getPreviewTypeLabel(item.question.type),
      options: item.question.options,
      correctAnswer: item.question.correctAnswer ?? null,
      answerText: getPreviewAnswerText(
        item.question.type,
        item.question.correctAnswer,
      ),
    }));

const buildBaseExamView = (
  exam: QueryExamList | QueryExamDetail,
): MyExamListView => {
  const totalStudents = exam.class.studentCount;
  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
  const questionCountLabel = `${exam.questions.length} асуулт`;
  const durationLabel = `${exam.durationMinutes} минут`;
  const totalPointsLabel = `${totalPoints} оноо`;
  const submittedAttempts = exam.attempts.filter(
    (attempt) => attempt.status !== AttemptStatus.InProgress,
  );
  const passed = submittedAttempts.filter((attempt) =>
    hasPassedExam(
      attempt.totalScore,
      totalPoints,
      exam.passingCriteriaType,
      exam.passingThreshold,
    ),
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
    classGrade: exam.class.grade,
    createdDateLabel: formatDateOnly(exam.createdAt),
    questionCount: exam.questions.length,
    totalPoints,
    passingCriteriaType: exam.passingCriteriaType,
    passingThreshold: exam.passingThreshold,
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
  };
};

export const buildMyExamListViews = (exams: QueryExamList[]): MyExamListView[] =>
  [...exams]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .map((exam) => buildBaseExamView(exam));

export const buildMyExamDetailView = (exam: QueryExamDetail): MyExamView => {
  const base = buildBaseExamView(exam);
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
        value: answer.value,
        displayValue: formatAnswerValue(answer.question.type, answer.value),
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
      total: base.totalPoints,
      percent: calculatePercent(attempt.totalScore, base.totalPoints),
      statusLabel: getAttemptLabel(attempt.status),
      statusTone: getAttemptStatus(attempt.status),
      submitted: formatDate(attempt.submittedAt ?? attempt.startedAt),
      answers,
    };
  });

  return {
    ...base,
    previewQuestions: buildPreviewQuestions(exam),
    students: studentRows,
  };
};
