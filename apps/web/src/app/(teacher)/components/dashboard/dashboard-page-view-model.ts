import type { DashboardOverviewQuery } from "@/graphql/generated";
import {
  clampPercent,
  formatDashboardDateTime,
  formatDraftSubtitle,
  formatQuestionCount,
  formatReviewSubtitle,
  formatScheduledSubtitle,
} from "./dashboard-formatters";
import type { DashboardPageViewModel } from "./dashboard-types";

const quickActions: DashboardPageViewModel["quickActions"] = [
  {
    label: "Шалгалт үүсгэх",
    description: "Шинэ шалгалтын бүтэц, асуултаа бүрдүүлнэ.",
    href: "/create-exam",
    icon: "create",
    primary: true,
  },
  {
    label: "Дүн шалгах",
    description: "Ирсэн оролдлого, үр дүнгээ шалгана.",
    href: "/my-exams",
    icon: "review",
  },
  {
    label: "Анги удирдах",
    description: "Анги, сурагчдын мэдээллээ цэгцэлнэ.",
    href: "/classes",
    icon: "classes",
  },
  {
    label: "Асуултын сан",
    description: "Сангаас асуулт нэмэх, засварлана.",
    href: "/question-bank",
    icon: "bank",
  },
];

export const buildDashboardPageViewModel = (
  data: DashboardOverviewQuery,
): DashboardPageViewModel => {
  const overview = data.dashboardOverview;
  const pendingReviewCount = overview.summary.pendingReviewCount;
  const draftExamCount = overview.summary.draftExamCount;
  const ongoingExamCount = overview.summary.ongoingExamCount;
  const scheduledExamCount = overview.summary.scheduledExamCount;

  return {
    teacherName: overview.teacherName,
    stats: [
      {
        title: "Анхаарал шаардлагатай",
        value: pendingReviewCount.toLocaleString("mn-MN"),
        subtitle: formatReviewSubtitle(pendingReviewCount),
        actionLabel: "Дүн шалгах руу очих",
        href: "/my-exams",
        icon: "review",
      },
      {
        title: "Явагдаж байгаа",
        value: Math.max(draftExamCount, ongoingExamCount).toLocaleString("mn-MN"),
        subtitle: formatDraftSubtitle(draftExamCount, ongoingExamCount),
        actionLabel: "Шалгалт үүсгэх",
        href: "/create-exam",
        icon: "draft",
      },
      {
        title: "Товлогдсон",
        value: scheduledExamCount.toLocaleString("mn-MN"),
        subtitle: formatScheduledSubtitle(scheduledExamCount),
        actionLabel: "Хуваарь харах",
        href: "/my-exams",
        icon: "schedule",
      },
    ],
    quickActions,
    upcomingExams: overview.upcomingExams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      scheduledLabel: formatDashboardDateTime(exam.scheduledFor),
      questionCountLabel: formatQuestionCount(exam.questionCount),
      href: `/my-exams`,
    })),
    recentResults: overview.recentResults.map((exam) => ({
      id: exam.id,
      title: exam.title,
      passCount: exam.passCount,
      failCount: exam.failCount,
      progressPercent: clampPercent(exam.progressPercent),
      averageScoreLabel: `Дундаж ${clampPercent(exam.averageScorePercent)}%`,
      href: "/my-exams",
    })),
    hasAnyData:
      pendingReviewCount > 0 ||
      draftExamCount > 0 ||
      ongoingExamCount > 0 ||
      scheduledExamCount > 0 ||
      overview.upcomingExams.length > 0 ||
      overview.recentResults.length > 0,
  };
};
