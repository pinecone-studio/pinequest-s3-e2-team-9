import {
  AttemptIntegrityEventType,
  ClassStudentStatus,
  ExamStatus,
  IntegrityRiskLevel,
  IntegritySeverity,
} from "@/graphql/generated";

const relativeFormatter = new Intl.RelativeTimeFormat("mn", {
  numeric: "auto",
});
const absoluteDateTimeFormatter = new Intl.DateTimeFormat("mn-MN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
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

export const formatAbsoluteDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "Тодорхойгүй";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Тодорхойгүй";
  }

  return absoluteDateTimeFormatter.format(timestamp);
};

export const formatDurationMs = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value) || value < 0) {
    return "Тодорхойгүй";
  }

  const totalMinutes = Math.round(value / (1000 * 60));
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours} цаг ${minutes} минут` : `${hours} цаг`;
  }

  if (totalMinutes >= 1) {
    return `${totalMinutes} минут`;
  }

  const totalSeconds = Math.max(1, Math.round(value / 1000));
  return `${totalSeconds} сек`;
};

export const formatIntegrityRisk = (
  risk: IntegrityRiskLevel,
  eventCount: number,
) => {
  if (eventCount === 0) {
    return "Цэвэр";
  }

  if (risk === IntegrityRiskLevel.High) {
    return "Өндөр";
  }

  return risk === IntegrityRiskLevel.Medium ? "Дунд" : "Бага";
};

export const formatIntegritySeverity = (severity: IntegritySeverity) => {
  if (severity === IntegritySeverity.High) {
    return "Өндөр";
  }

  return severity === IntegritySeverity.Medium ? "Дунд" : "Бага";
};

export const formatIntegritySignal = (type: AttemptIntegrityEventType) => {
  switch (type) {
    case AttemptIntegrityEventType.TabHidden:
      return "Tab";
    case AttemptIntegrityEventType.WindowBlur:
      return "Focus";
    case AttemptIntegrityEventType.FullscreenExit:
      return "Fullscreen";
    case AttemptIntegrityEventType.PasteAttempt:
      return "Paste";
    case AttemptIntegrityEventType.CopyAttempt:
      return "Copy";
    case AttemptIntegrityEventType.BulkInputBurst:
      return "Огцом текст";
    case AttemptIntegrityEventType.InactiveThenBulkInput:
      return "Удаад их текст";
    default:
      return type;
  }
};
