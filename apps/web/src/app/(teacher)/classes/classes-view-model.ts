import type {
  ClassDetailQuery,
  ClassesListQuery,
  ClassStudentStatus,
} from "@/graphql/generated";
import {
  formatExamStatus,
  formatGradeLabel,
  formatPercentage,
  formatRelativeTime,
  formatStudentStatus,
} from "./classes-format";

type StatusTone = "success" | "warning" | "muted";

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
    students: item.studentInsights.map((entry) => ({
      id: entry.student.id,
      name: entry.student.fullName,
      email: entry.student.email,
      status: formatStudentStatus(entry.status as ClassStudentStatus),
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
    })),
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
