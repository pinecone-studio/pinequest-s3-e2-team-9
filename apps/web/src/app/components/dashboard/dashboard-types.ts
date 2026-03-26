export type AttentionCardView = {
  label: string;
  value: number;
  tone: "warning" | "neutral" | "danger" | "success";
  icon: "alert" | "calendar" | "archive" | "activity";
};

export type ActiveExamView = {
  id: string;
  title: string;
  className: string;
  statusLabel: string;
  durationLabel: string;
  createdAtLabel: string;
  inProgressCount: number;
  submittedCount: number;
  pendingReviewCount: number;
  totalStudents: number;
  progressPercent: number;
};

export type UpcomingExamView = {
  id: string;
  title: string;
  className: string;
  statusLabel: string;
  createdAtLabel: string;
};

export type RecentExamView = {
  id: string;
  title: string;
  passRate: number;
  passCount: number;
  failCount: number;
  averageScorePercent: number;
};

export type DashboardViewModel = {
  teacherName: string;
  activeExam: ActiveExamView | null;
  attentionCards: AttentionCardView[];
  upcomingExams: UpcomingExamView[];
  recentExams: RecentExamView[];
};

export type DashboardSummaryCardView = {
  title: string;
  value: string;
  subtitle: string;
  actionLabel: string;
  href: string;
  icon: "review" | "draft" | "schedule";
};

export type DashboardQuickActionView = {
  label: string;
  description: string;
  href: string;
  icon: "create" | "review" | "classes" | "bank";
  primary?: boolean;
};

export type DashboardUpcomingExamItem = {
  id: string;
  title: string;
  scheduledLabel: string;
  questionCountLabel: string;
  href: string;
};

export type DashboardRecentResultItem = {
  id: string;
  title: string;
  passCount: number;
  failCount: number;
  progressPercent: number;
  averageScoreLabel: string;
  href: string;
};

export type DashboardPageViewModel = {
  teacherName: string;
  stats: DashboardSummaryCardView[];
  quickActions: DashboardQuickActionView[];
  upcomingExams: DashboardUpcomingExamItem[];
  recentResults: DashboardRecentResultItem[];
  hasAnyData: boolean;
};
