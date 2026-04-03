export type StudentStatusTone = "active" | "upcoming" | "completed";

export type StudentDashboardStat = {
  accent: string;
  label: string;
  note: string;
  value: string;
};

export type StudentTrendPoint = {
  label: string;
  value: number;
};

export type StudentCalendarDay = {
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  key: string;
  markers: Array<"exam" | "deadline" | "result">;
};

export type StudentScheduledExamCard = {
  actionDisabled: boolean;
  actionLabel: string;
  dateLabel: string;
  durationLabel: string;
  href: string;
  id: string;
  questionCountLabel: string;
  scoreLabel: string | null;
  searchText: string;
  status: StudentStatusTone;
  statusLabel: string;
  subject: string;
  title: string;
};

export type StudentPracticeExamCard = {
  attemptLabel: string;
  ctaLabel: string;
  durationLabel: string;
  href: string;
  resultHref: string | null;
  id: string;
  hasResult: boolean;
  level: "easy" | "medium" | "hard";
  levelLabel: string;
  progressLabel: string;
  questionCountLabel: string;
  searchText: string;
  subject: string;
  title: string;
  xpLabel: string;
};

export type StudentResultItem = {
  dateLabel: string;
  href: string;
  id: string;
  percentLabel: string;
  scoreLabel: string;
  statusLabel: string;
  subject: string;
  title: string;
};

export type StudentHomeViewModel = {
  classIds: string[];
  dashboard: {
    averageLabel: string;
    calendarDays: StudentCalendarDay[];
    calendarMonthLabel: string;
    stats: StudentDashboardStat[];
    studentName: string;
    trend: StudentTrendPoint[];
    upcoming: StudentScheduledExamCard[];
  };
  myExams: {
    active: StudentScheduledExamCard[];
    completed: StudentScheduledExamCard[];
    upcoming: StudentScheduledExamCard[];
  };
  practice: {
    easy: StudentPracticeExamCard[];
    hard: StudentPracticeExamCard[];
    medium: StudentPracticeExamCard[];
    totalXpLabel: string;
    totalXpValue: number;
  };
  results: {
    averageLabel: string;
    bestLabel: string;
    completedLabel: string;
    insights: string[];
    items: StudentResultItem[];
    strongestSubject: string;
  };
};
