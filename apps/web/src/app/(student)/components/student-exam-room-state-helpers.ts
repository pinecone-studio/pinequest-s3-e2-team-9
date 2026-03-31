import { formatRemaining, getExamEnd, getExamStart, parseDate } from "./student-home-time";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";

export const enterFullscreen = async () => {
  if (typeof document === "undefined" || document.fullscreenElement) {
    return false;
  }

  if (!document.documentElement.requestFullscreen) {
    return false;
  }

  try {
    await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return false;
  }
};

export const exitFullscreen = async () => {
  if (typeof document === "undefined" || !document.fullscreenElement) {
    return;
  }

  try {
    await document.exitFullscreen();
  } catch {
    // Ignore fullscreen cleanup failures.
  }
};

export const buildPersistedAnswers = ({
  currentAttempt,
  localPersistedAnswers,
}: {
  currentAttempt: StudentExamAttempt | null;
  localPersistedAnswers: { attemptId: string | null; values: Record<string, string> };
}) => {
  const basePersistedAnswers = Object.fromEntries(
    currentAttempt?.answers.map((answer) => [answer.question.id, answer.value]) ?? [],
  );

  return {
    ...basePersistedAnswers,
    ...(localPersistedAnswers.attemptId === currentAttempt?.id
      ? localPersistedAnswers.values
      : {}),
  };
};

export const getRemainingLabel = ({
  exam,
  currentAttempt,
  nowMs,
}: {
  exam: StudentExamData | null;
  currentAttempt: StudentExamAttempt | null;
  nowMs: number;
}) => {
  const examEnd = !exam
    ? null
    : exam.endsAt ?? (() => {
        const startedAt = parseDate(currentAttempt?.startedAt ?? getExamStart(exam));
        return startedAt
          ? new Date(startedAt.getTime() + exam.durationMinutes * 60_000).toISOString()
          : getExamEnd(exam);
      })();

  return currentAttempt
    ? formatRemaining((parseDate(examEnd)?.getTime() ?? nowMs) - nowMs)
    : `${exam?.durationMinutes ?? 0} минут`;
};

export const countAnsweredQuestions = ({
  attemptAnswers,
  draftAnswers,
  exam,
}: {
  attemptAnswers: Map<string, string>;
  draftAnswers: Record<string, string>;
  exam: StudentExamData | null;
}) =>
  exam
    ? exam.questions.filter((item) =>
        Boolean((draftAnswers[item.question.id] ?? attemptAnswers.get(item.question.id) ?? "").trim()),
      ).length
    : 0;

export const getTotalPoints = (exam: StudentExamData | null) =>
  exam?.questions.reduce((sum, item) => sum + item.points, 0) ?? 0;
