import { ExamStatus, ClassStudentStatus } from "@/graphql/generated";

const relativeFormatter = new Intl.RelativeTimeFormat("mn", {
  numeric: "auto",
});

const relativeUnits = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
] as const;

export const formatGradeLabel = (grade: number) => `${grade}-р анги`;

export const formatPercentage = (value: number | null | undefined) =>
  `${Math.round(value ?? 0)}%`;

export const formatStudentStatus = (status: ClassStudentStatus) => {
  if (status === ClassStudentStatus.Completed) {
    return "Дууссан";
  }

  return status === ClassStudentStatus.InProgress ? "Явцтай" : "Эхлээгүй";
};

export const formatExamStatus = (status: ExamStatus) => {
  if (status === ExamStatus.Closed) {
    return "Дууссан";
  }

  return status === ExamStatus.Published ? "Явагдаж буй" : "Ноорог";
};

export const formatRelativeTime = (value: string | null | undefined) => {
  if (!value) {
    return "Идэвхгүй";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Тодорхойгүй";
  }

  const diff = timestamp - Date.now();
  for (const { unit, ms } of relativeUnits) {
    if (Math.abs(diff) >= ms || unit === "minute") {
      return relativeFormatter.format(Math.round(diff / ms), unit);
    }
  }

  return "Саяхан";
};
