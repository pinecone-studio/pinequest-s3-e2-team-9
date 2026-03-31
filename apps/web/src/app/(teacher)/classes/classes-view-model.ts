import type {
  AttemptIntegrityEventType,
  ClassDetailQuery,
  ClassesListQuery,
  ClassStudentStatus,
  IntegritySeverity,
} from "@/graphql/generated";
import {
  formatExamStatus,
  formatGradeLabel,
  formatIntegrityRisk,
  formatIntegritySeverity,
  formatIntegritySignal,
  formatPercentage,
  formatRelativeTime,
  formatStudentStatus,
} from "./classes-format";

type StatusTone = "success" | "warning" | "muted";
type IntegrityTone = StatusTone | "danger";
type StudentInsightRisk =
  NonNullable<ClassDetailQuery["class"]>["studentInsights"][number]["integrityRisk"];

export type ClassStudentIntegritySignalView = {
  label: string;
  count: number;
  severityLabel: string;
  tone: IntegrityTone;
};

export type ClassStudentIntegrityEventView = {
  id: string;
  type: AttemptIntegrityEventType;
  severity: IntegritySeverity;
  details: string;
  createdAt: string;
};

export type ClassStudentTableRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  lastActive: string;
  averageScore: string;
  integrityDetail: string;
  integrityRiskLabel: string;
  integrityLabel: string;
  integrityTone: IntegrityTone;
  integrityEventCount: number;
  integritySignals: ClassStudentIntegritySignalView[];
  integrityEvents: ClassStudentIntegrityEventView[];
  searchText: string;
  tone: StatusTone;
};

const resolveIntegrityTone = (
  suspiciousEventCount: number,
  integrityRisk: StudentInsightRisk,
) =>
  (
    suspiciousEventCount === 0
      ? "success"
      : integrityRisk === "HIGH"
        ? "danger"
        : integrityRisk === "MEDIUM"
          ? "warning"
          : "muted"
  ) as IntegrityTone;

export const buildClassesListViewModel = (data: ClassesListQuery) =>
  data.classes.map((item) => ({
    id: item.id,
    href: `/classes/${item.id}`,
    name: item.name,
    meta: `${item.subject} · ${formatGradeLabel(item.grade)}`,
    studentCountLabel: `${item.studentCount} сурагч`,
    upcomingLabel: `${item.upcomingExamCount} шалгалт удахгүй`,
    completedLabel: `${item.completedExamCount} шалгалт дууссан`,
    searchText: `${item.name} ${item.subject} ${item.grade}`,
  }));

export const buildClassDetailViewModel = (
  item: ClassDetailQuery["class"],
) => {
  if (!item) {
    return null;
  }

  const formatOptionalPercentage = (value: number | null | undefined) =>
    value === null || value === undefined ? "-" : formatPercentage(value);

  return {
    id: item.id,
    name: item.name,
    subtitle: `${item.subject} · ${formatGradeLabel(item.grade)} · Багш: ${item.teacher.fullName}`,
    studentCount: item.studentCount,
    summaryCards: [
      { label: "сурагч", value: String(item.studentCount) },
      { label: "Оноосон шалгалтууд", value: String(item.assignedExamCount) },
      { label: "Дууссан", value: String(item.completedExamCount) },
      { label: "Дундаж оноо", value: formatPercentage(item.averageScore) },
    ],
    students: item.studentInsights.map((entry) => {
      const integrityRiskLabel = formatIntegrityRisk(
        entry.integrityRisk,
        entry.suspiciousEventCount,
      );
      const integrityTone = resolveIntegrityTone(
        entry.suspiciousEventCount,
        entry.integrityRisk,
      );

      return {
        id: entry.student.id,
        name: entry.student.fullName,
        email: entry.student.email,
        status: formatStudentStatus(entry.status as ClassStudentStatus),
        integrityDetail:
          entry.suspiciousEventCount > 0
            ? `${entry.integritySignals
                .slice(0, 2)
                .map((signal) => `${formatIntegritySignal(signal.type)} x${signal.count}`)
                .join(", ")}${entry.lastIntegrityEventAt ? ` · ${formatRelativeTime(entry.lastIntegrityEventAt)}` : ""}`
            : "Flag алга",
        integrityRiskLabel,
        integrityLabel: `${integrityRiskLabel}${entry.suspiciousEventCount > 0 ? ` · ${entry.suspiciousEventCount}` : ""}`,
        integrityTone,
        integrityEventCount: entry.suspiciousEventCount,
        integritySignals: entry.integritySignals.map((signal) => ({
          label: formatIntegritySignal(signal.type),
          count: signal.count,
          severityLabel: formatIntegritySeverity(signal.severity),
          tone: (
            signal.severity === "HIGH"
              ? "danger"
              : signal.severity === "MEDIUM"
                ? "warning"
                : "muted"
          ) as IntegrityTone,
        })),
        integrityEvents: entry.integrityEvents.map((event) => ({
          id: event.id,
          type: event.type,
          severity: event.severity,
          details: event.details,
          createdAt: event.createdAt,
        })),
        lastActive: formatRelativeTime(entry.lastActiveAt),
        averageScore: formatOptionalPercentage(entry.averageScore),
        searchText: `${entry.student.fullName} ${entry.student.email}`,
        tone: (
          entry.status === "COMPLETED"
            ? "success"
            : entry.status === "IN_PROGRESS"
              ? "warning"
              : "muted"
        ) as StatusTone,
      } satisfies ClassStudentTableRow;
    }),
    exams: item.examInsights.map((entry) => ({
      id: entry.exam.id,
      title: entry.exam.title,
      meta: `${entry.exam.durationMinutes} минут · ${entry.questionCount} асуулт`,
      rawStatus: entry.exam.status,
      durationMinutes: entry.exam.durationMinutes,
      status: formatExamStatus(entry.exam.status),
      submitted: `${entry.submittedCount}/${entry.totalStudents}`,
      progressPercent: entry.progressPercent,
      averageScore: formatOptionalPercentage(entry.averageScore),
      statusTone: (
        entry.exam.status === "CLOSED"
          ? "success"
          : entry.exam.status === "PUBLISHED"
            ? "warning"
            : "muted"
      ) as StatusTone,
    })),
  };
};
