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
