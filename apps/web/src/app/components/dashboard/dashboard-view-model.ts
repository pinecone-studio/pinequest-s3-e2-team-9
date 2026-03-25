import {
  AttemptStatus,
  ExamStatus,
  type DashboardOverviewQuery,
} from "@/graphql/generated";
import type {
  ActiveExamView,
  DashboardViewModel,
  RecentExamView,
} from "./dashboard-types";

type DashboardExam = DashboardOverviewQuery["exams"][number];
type DashboardAttempt = DashboardExam["attempts"][number];

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("mn-MN", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const toTimestamp = (dateString: string): number => {
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDateTime = (dateString: string): string =>
  DATE_TIME_FORMATTER.format(new Date(dateString));

const isSubmittedLike = (status: AttemptStatus): boolean =>
  status === AttemptStatus.Submitted || status === AttemptStatus.Graded;

const countAttempts = (
  exams: DashboardExam[],
  matcher: (attempt: DashboardAttempt) => boolean,
): number =>
  exams.reduce(
    (total, exam) =>
      total + exam.attempts.reduce((examTotal, attempt) => examTotal + (matcher(attempt) ? 1 : 0), 0),
    0,
  );

const getExamTotalPoints = (exam: DashboardExam): number =>
  exam.questions.reduce((total, question) => total + question.points, 0);

const getAttemptPercent = (score: number, maxScore: number): number => {
  if (maxScore <= 0) {
    return 0;
  }
  const percent = (score / maxScore) * 100;
  return Math.max(0, Math.min(100, percent));
};

const toRecentExam = (exam: DashboardExam): RecentExamView => {
  const relevantAttempts = exam.attempts.filter((attempt) => isSubmittedLike(attempt.status));
  const maxScore = getExamTotalPoints(exam);

  if (relevantAttempts.length === 0 || maxScore <= 0) {
    return {
      id: exam.id,
      title: exam.title,
      passRate: 0,
      passCount: 0,
      failCount: 0,
      averageScorePercent: 0,
    };
  }

  const attemptPercents = relevantAttempts.map((attempt) =>
    getAttemptPercent(attempt.totalScore, maxScore),
  );
  const passCount = attemptPercents.filter((scorePercent) => scorePercent >= 60).length;
  const failCount = Math.max(0, relevantAttempts.length - passCount);
  const averageScorePercent = Math.round(
    attemptPercents.reduce((total, scorePercent) => total + scorePercent, 0) /
      attemptPercents.length,
  );

  return {
    id: exam.id,
    title: exam.title,
    passRate: Math.round((passCount / relevantAttempts.length) * 100),
    passCount,
    failCount,
    averageScorePercent,
  };
};

export const buildDashboardViewModel = (
  data: DashboardOverviewQuery,
): DashboardViewModel => {
  const exams = [...data.exams].sort(
    (left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt),
  );

  const publishedExams = exams.filter((exam) => exam.status === ExamStatus.Published);
  const activeExamSource =
    publishedExams.find((exam) =>
      exam.attempts.some((attempt) => attempt.status === AttemptStatus.InProgress),
    ) ?? null;

  const activeExam = activeExamSource
    ? (() => {
        const inProgressCount = activeExamSource.attempts.filter(
          (attempt) => attempt.status === AttemptStatus.InProgress,
        ).length;
        const submittedCount = activeExamSource.attempts.filter((attempt) =>
          isSubmittedLike(attempt.status),
        ).length;
        const pendingReviewCount = activeExamSource.attempts.filter(
          (attempt) => attempt.status === AttemptStatus.Submitted,
        ).length;
        const totalStudents = activeExamSource.class.students.length;
        const progressPercent =
          totalStudents > 0 ? Math.min(100, Math.round((submittedCount / totalStudents) * 100)) : 0;

        return {
          id: activeExamSource.id,
          title: activeExamSource.title,
          className: activeExamSource.class.name,
          statusLabel: "Явагдаж буй",
          durationLabel: `${activeExamSource.durationMinutes} минут`,
          createdAtLabel: formatDateTime(activeExamSource.createdAt),
          inProgressCount,
          submittedCount,
          pendingReviewCount,
          totalStudents,
          progressPercent,
        } satisfies ActiveExamView;
      })()
    : null;

  return {
    teacherName: data.me?.fullName ?? "Багш",
    activeExam,
    attentionCards: [
      {
        label: "Шалгах хариултууд",
        value: countAttempts(exams, (attempt) => attempt.status === AttemptStatus.Submitted),
        tone: "warning",
        icon: "alert",
      },
      {
        label: "Ноорог шалгалтууд",
        value: exams.filter((exam) => exam.status === ExamStatus.Draft).length,
        tone: "neutral",
        icon: "calendar",
      },
      {
        label: "Хаагдсан шалгалтууд",
        value: exams.filter((exam) => exam.status === ExamStatus.Closed).length,
        tone: "neutral",
        icon: "archive",
      },
      {
        label: "Явагдаж буй оролдлого",
        value: countAttempts(exams, (attempt) => attempt.status === AttemptStatus.InProgress),
        tone: "success",
        icon: "activity",
      },
    ],
    upcomingExams: exams
      .filter((exam) => exam.status === ExamStatus.Draft)
      .slice(0, 3)
      .map((exam) => ({
        id: exam.id,
        title: exam.title,
        className: exam.class.name,
        statusLabel: "Ноорог",
        createdAtLabel: formatDateTime(exam.createdAt),
      })),
    recentExams: exams
      .filter((exam) => exam.status !== ExamStatus.Draft && exam.id !== activeExam?.id)
      .slice(0, 3)
      .map(toRecentExam),
  };
};
