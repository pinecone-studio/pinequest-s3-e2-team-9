import { AttemptStatus, ExamMode, type StudentHomeQuery } from "@/graphql/generated";
import { formatClock, formatMonthDayWithYear, getExamEnd, getExamStart, parseDate } from "./student-home-time";

type QueryExam = StudentHomeQuery["exams"][number];
type QueryAttempt = StudentHomeQuery["attempts"][number];

export const getLatestAttemptByExamId = (attempts: QueryAttempt[]) => {
  const map = new Map<string, QueryAttempt>();
  for (const attempt of [...attempts].sort(
    (a, b) =>
      new Date(b.submittedAt ?? b.startedAt).getTime() -
      new Date(a.submittedAt ?? a.startedAt).getTime(),
  )) {
    if (!map.has(attempt.exam.id)) map.set(attempt.exam.id, attempt);
  }
  return map;
};

export const getPercent = (score: number, total: number) =>
  total > 0 ? Math.round((score / total) * 100) : 0;

export const getTotalPoints = (exam: QueryExam | QueryAttempt["exam"]) =>
  exam.questions.reduce((sum, question) => sum + question.points, 0);

export const getScheduledStatus = (exam: QueryExam, attempt: QueryAttempt | undefined, nowMs: number) => {
  if (attempt?.status === AttemptStatus.InProgress) return "active" as const;
  if (attempt) return "completed" as const;
  const startMs = parseDate(getExamStart(exam))?.getTime() ?? 0;
  const endMs = parseDate(getExamEnd(exam))?.getTime() ?? startMs;
  if (nowMs < startMs) return "upcoming" as const;
  if (nowMs <= endMs) return "active" as const;
  return "completed" as const;
};

export const getScheduledCopy = (status: ReturnType<typeof getScheduledStatus>) => {
  if (status === "active") return { actionLabel: "Үргэлжлүүлэх", statusLabel: "Явагдаж буй" };
  if (status === "upcoming") return { actionLabel: "Удахгүй нээгдэнэ", statusLabel: "Удахгүй" };
  return { actionLabel: "Харах", statusLabel: "Дууссан" };
};

export const getScheduledDateLabel = (exam: QueryExam, attempt: QueryAttempt | undefined, status: ReturnType<typeof getScheduledStatus>) => {
  if (status === "active") {
    return `${formatMonthDayWithYear(getExamStart(exam))} · ${formatClock(getExamStart(exam))} - ${formatClock(getExamEnd(exam))}`;
  }
  if (status === "upcoming") return `${formatMonthDayWithYear(getExamStart(exam))}-нд товлогдсон`;
  return attempt ? `${formatMonthDayWithYear(attempt.submittedAt ?? attempt.startedAt)}-нд өгсөн` : `${formatMonthDayWithYear(getExamEnd(exam))}-нд хаагдсан`;
};

// Backend suggestion: practice level болон XP-г API-аас шууд өгвөл энэ heuristic-ийг client дээр хадгалах шаардлагагүй болно.
export const getPracticeLevel = (exam: QueryExam) => {
  const score = exam.durationMinutes + exam.questions.length * 3;
  if (score <= 55) return "easy" as const;
  if (score <= 90) return "medium" as const;
  return "hard" as const;
};

export const getPracticeCopy = (level: ReturnType<typeof getPracticeLevel>) => {
  if (level === "easy") return { label: "Хялбар", xp: 120 };
  if (level === "medium") return { label: "Дунд", xp: 180 };
  return { label: "Хэцүү", xp: 260 };
};

export const getStudentName = (fullName: string | null | undefined) => {
  const trimmed = fullName?.trim();
  return trimmed?.length ? trimmed.split(" ").at(-1) ?? trimmed : "сурагч";
};

export const getSubjectSummary = (items: Array<{ percent: number; subject: string }>) => {
  const subjectAverages = new Map<string, { count: number; total: number }>();
  for (const item of items) {
    const current = subjectAverages.get(item.subject) ?? { count: 0, total: 0 };
    subjectAverages.set(item.subject, { count: current.count + 1, total: current.total + item.percent });
  }
  return [...subjectAverages.entries()]
    .map(([subject, value]) => ({ subject, average: value.total / value.count }))
    .sort((a, b) => b.average - a.average)[0]?.subject ?? "Одоогоор тодорхойгүй";
};

export const buildCalendarDays = (
  exams: QueryExam[],
  attempts: QueryAttempt[],
  anchor: Date,
) => {
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const markers = new Set<"exam" | "deadline" | "result">();
    exams.filter((exam) => exam.mode !== ExamMode.Practice).forEach((exam) => {
      if (getExamStart(exam)?.slice(0, 10) === key) markers.add("exam");
      if (getExamEnd(exam)?.slice(0, 10) === key) markers.add("deadline");
    });
    attempts.forEach((attempt) => {
      if ((attempt.submittedAt ?? attempt.startedAt).slice(0, 10) === key) markers.add("result");
    });
    return {
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === monthStart.getMonth(),
      isToday: key === new Date().toISOString().slice(0, 10),
      key,
      markers: [...markers],
    };
  });
};
