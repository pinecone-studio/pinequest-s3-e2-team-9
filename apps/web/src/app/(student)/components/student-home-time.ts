import type { StudentHomeQuery } from "@/graphql/generated";

type QueryExam = StudentHomeQuery["exams"][number];
type QueryAttempt = StudentHomeQuery["attempts"][number];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatMonthDay = (value: string | null | undefined) => {
  const date = parseDate(value);
  if (!date) return "Хугацаа тодорхойгүй";
  return `${date.getMonth() + 1} сарын ${date.getDate()}`;
};

export const formatClock = (value: string | null | undefined) => {
  const date = parseDate(value);
  if (!date) return "Цаг тодорхойгүй";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export const formatRemaining = (remainingMs: number) => {
  if (remainingMs <= 0) return "Дууссан";
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days} хоног ${hours} цаг`;
  if (hours > 0) return `${hours}ц ${minutes}м`;
  return `${minutes}м : ${String(seconds).padStart(2, "0")}с`;
};

export const getExamStart = (
  exam: QueryExam | QueryAttempt["exam"],
  attempt?: QueryAttempt,
) => attempt?.startedAt ?? exam.startedAt ?? exam.scheduledFor ?? exam.createdAt;

export const getExamEnd = (
  exam: QueryExam | QueryAttempt["exam"],
  attempt?: QueryAttempt,
) => {
  if (exam.endsAt) return exam.endsAt;
  const start = parseDate(getExamStart(exam, attempt));
  if (!start) return null;
  return new Date(start.getTime() + exam.durationMinutes * 60_000).toISOString();
};

export const getProgress = ({
  exam,
  nowMs,
  tone,
}: {
  exam: QueryExam | QueryAttempt["exam"];
  nowMs: number;
  tone: "available" | "live";
}) => {
  const start = parseDate(getExamStart(exam));
  const end = parseDate(getExamEnd(exam));

  if (start && end) {
    const total = Math.max(end.getTime() - start.getTime(), 1);
    if (tone === "live") return Math.max(0.08, Math.min(1, (end.getTime() - nowMs) / total));
    if (nowMs < start.getTime()) {
      return Math.max(0.18, Math.min(0.92, 1 - (start.getTime() - nowMs) / (14 * DAY_IN_MS)));
    }
    return Math.max(0.18, Math.min(0.92, (end.getTime() - nowMs) / total));
  }

  return tone === "live" ? 0.15 : 0.72;
};
