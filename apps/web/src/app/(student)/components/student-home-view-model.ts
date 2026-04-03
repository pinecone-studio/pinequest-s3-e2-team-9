import { AttemptStatus, ExamMode, ExamStatus, type StudentHomeQuery } from "@/graphql/generated";
import type { StudentHomeViewModel } from "./student-portal-types";
import { formatMonthYear } from "./student-home-time";
import {
  buildCalendarDays,
  getLatestAttemptByExamId,
  getPercent,
  getPracticeCopy,
  getPracticeLevel,
  getScheduledCopy,
  getScheduledDateLabel,
  getScheduledStatus,
  getStudentName,
  getSubjectSummary,
  getTotalPoints,
} from "./student-portal-utils";

const formatPercent = (value: number) => `${Math.round(value)}%`;

export const buildStudentHomeViewModel = (data: StudentHomeQuery): StudentHomeViewModel => {
  const nowMs = Date.now();
  const latestAttemptByExamId = getLatestAttemptByExamId(data.attempts);
  const scheduled = data.exams
    .filter((exam) => exam.mode !== ExamMode.Practice && exam.status === ExamStatus.Published)
    .map((exam) => {
      const attempt = latestAttemptByExamId.get(exam.id);
      const status = getScheduledStatus(exam, attempt, nowMs);
      const total = getTotalPoints(exam);
      const percent = attempt && attempt.status !== AttemptStatus.InProgress
        ? getPercent(attempt.totalScore, total)
        : null;
      return {
        actionDisabled: status === "upcoming",
        actionLabel: getScheduledCopy(status).actionLabel,
        dateLabel: getScheduledDateLabel(exam, attempt, status),
        durationLabel: `${exam.durationMinutes} минут`,
        href: `/student/exams/${exam.id}`,
        id: exam.id,
        questionCountLabel: `${exam.questions.length} асуулт`,
        scoreLabel: percent === null ? null : `${percent}%`,
        searchText: `${exam.title} ${exam.class.subject} ${exam.class.teacher.fullName}`.toLowerCase(),
        status,
        statusLabel: getScheduledCopy(status).statusLabel,
        subject: exam.class.subject || exam.class.name,
        title: exam.title,
      };
    })
    .sort((a, b) => a.status.localeCompare(b.status) || a.dateLabel.localeCompare(b.dateLabel));

  const resultItems = data.attempts
    .filter((attempt) => attempt.status !== AttemptStatus.InProgress)
    .map((attempt) => {
      const total = getTotalPoints(attempt.exam);
      const percent = getPercent(attempt.totalScore, total);
      return {
        dateLabel: new Date(attempt.submittedAt ?? attempt.startedAt).toLocaleDateString("mn-MN"),
        href: `/student/exams/${attempt.exam.id}`,
        id: attempt.id,
        percent,
        percentLabel: `${percent}%`,
        scoreLabel: `${attempt.totalScore}/${total} оноо`,
        statusLabel: attempt.status === AttemptStatus.Graded ? "Шалгасан" : "Илгээсэн",
        subject: attempt.exam.class.subject || attempt.exam.class.name,
        title: attempt.exam.title,
      };
    })
    .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));

  const practice = data.exams
    .filter((exam) => exam.mode === ExamMode.Practice && exam.status === ExamStatus.Published)
    .map((exam) => {
      const attempts = data.attempts.filter((attempt) => attempt.exam.id === exam.id);
      const completedAttempts = attempts.filter(
        (attempt) => attempt.status !== AttemptStatus.InProgress,
      );
      const level = getPracticeLevel(exam);
      const copy = getPracticeCopy(level);
      return {
        attemptLabel: `${attempts.length} оролдлого`,
        ctaLabel: attempts.length ? "Дахин сорих" : "Эхлэх",
        durationLabel: `${exam.durationMinutes} минут`,
        href: `/student/exams/${exam.id}`,
        id: exam.id,
        hasResult: completedAttempts.length > 0,
        level,
        levelLabel: copy.label,
        progressLabel: attempts.length
          ? "Оноогоо ахиулж, дараагийн шатны сорил руу шилжээрэй."
          : "Шинэ сорил эхлүүлээд анхны XP-ээ аваарай.",
        questionCountLabel: `${exam.questions.length} асуулт`,
        resultHref: completedAttempts.length ? `/student/exams/${exam.id}` : null,
        searchText: `${exam.title} ${exam.class.subject}`.toLowerCase(),
        subject: exam.class.subject || exam.class.name,
        title: exam.title,
        xpLabel: `${copy.xp} XP`,
      };
    });

  const averagePercent = resultItems.length
    ? resultItems.reduce((sum, item) => sum + item.percent, 0) / resultItems.length
    : 0;
  const bestPercent = resultItems.length ? Math.max(...resultItems.map((item) => item.percent)) : 0;
  const trend = (resultItems.length ? resultItems.slice(0, 6).reverse() : [{ dateLabel: "Одоо", percent: 0 }]).map((item) => ({
    label: item.dateLabel.slice(5),
    value: item.percent,
  }));
  const insights = [
    averagePercent >= 80 ? "Тогтвортой өндөр гүйцэтгэлтэй байна. Хүнд түвшний сорилд түлхүү оролдоорой." : "Дундаж оноогоо тогтворжуулахын тулд чөлөөт сорилыг давтамжтай ашиглаарай.",
    bestPercent >= 90 ? "Шилдэг үзүүлэлт тань маш сайн байна. Энэ хэвээ хадгалаарай." : "Хамгийн сайн дүнгээ ахиулахын тулд дутуу сэдвүүдээ давтаж болно.",
    `Илүү сайн үзүүлэлттэй хичээл: ${getSubjectSummary(resultItems)}`,
  ];

  return {
    classIds: data.me?.classes.map((classroom) => classroom.id) ?? [],
    dashboard: {
      averageLabel: formatPercent(averagePercent),
      calendarDays: buildCalendarDays(data.exams, data.attempts, new Date()),
      calendarMonthLabel: formatMonthYear(new Date()),
      stats: [
        { accent: "bg-[#F4F3FF] text-[#6434F8]", label: "Идэвхтэй", note: "Яг одоо орж болох товлосон шалгалт", value: String(scheduled.filter((item) => item.status === "active").length) },
        { accent: "bg-[#ECFDF3] text-[#16A34A]", label: "Дундаж", note: "Нийт оролдлогын дундаж хувь", value: formatPercent(averagePercent) },
        { accent: "bg-[#FFF4E8] text-[#C46A00]", label: "Сорилын XP", note: "Чөлөөт сорилоос цуглуулсан нийт XP", value: `${practice.reduce((sum, item) => sum + Number(item.xpLabel.replace(/\D/g, "")), 0)}` },
      ],
      studentName: getStudentName(data.me?.fullName),
      trend,
      upcoming: scheduled.filter((item) => item.status !== "completed").slice(0, 3),
    },
    myExams: {
      active: scheduled.filter((item) => item.status === "active"),
      completed: scheduled.filter((item) => item.status === "completed"),
      upcoming: scheduled.filter((item) => item.status === "upcoming"),
    },
    practice: {
      easy: practice.filter((item) => item.level === "easy"),
      hard: practice.filter((item) => item.level === "hard"),
      medium: practice.filter((item) => item.level === "medium"),
      totalXpLabel: `${practice.reduce((sum, item) => sum + Number(item.xpLabel.replace(/\D/g, "")), 0)} XP`,
      totalXpValue: practice.reduce((sum, item) => sum + Number(item.xpLabel.replace(/\D/g, "")), 0),
    },
    results: {
      averageLabel: formatPercent(averagePercent),
      bestLabel: formatPercent(bestPercent),
      completedLabel: `${resultItems.length}`,
      insights,
      items: resultItems,
      strongestSubject: getSubjectSummary(resultItems),
    },
  };
};
