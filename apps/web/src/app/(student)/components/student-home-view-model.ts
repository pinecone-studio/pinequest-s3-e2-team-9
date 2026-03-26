import { AttemptStatus, ExamStatus, type StudentHomeQuery } from "@/graphql/generated";
import {
  formatClock,
  formatMonthDay,
  formatRemaining,
  getExamEnd,
  getExamStart,
  getProgress,
  parseDate,
} from "./student-home-time";

type QueryExam = StudentHomeQuery["exams"][number];
type QueryAttempt = StudentHomeQuery["attempts"][number];

export type StudentExamCardView = {
  duration: string;
  endLabel: string;
  id: string;
  points: string;
  progress: number;
  questionCount: string;
  searchText: string;
  startedLabel: string;
  subject: string;
  teacher: string;
  title: string;
};

export type StudentCompletedExamView = {
  id: string;
  scoreLabel: string;
  scoreTone: string;
  searchText: string;
  statusLabel: string;
  statusTone: string;
  subject: string;
  title: string;
};

export type StudentHomeViewModel = {
  availableExams: StudentExamCardView[];
  classIds: string[];
  completedExams: StudentCompletedExamView[];
  liveExam: StudentExamCardView | null;
};

const buildExamCard = ({
  exam,
  nowMs,
  tone,
}: {
  exam: QueryExam | QueryAttempt["exam"];
  nowMs: number;
  tone: "available" | "live";
}): StudentExamCardView => {
  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0);
  const start = getExamStart(exam);
  const end = getExamEnd(exam);
  const teacher = exam.class.teacher.fullName;
  const subject = exam.class.subject || exam.class.name;

  return {
    duration: `${exam.durationMinutes} минут`,
    endLabel: tone === "live"
      ? formatRemaining((parseDate(end)?.getTime() ?? nowMs) - nowMs)
      : formatMonthDay(end),
    id: exam.id,
    points: `${totalPoints} оноо`,
    progress: getProgress({ exam, nowMs, tone }),
    questionCount: `${exam.questions.length} асуулт`,
    searchText: `${exam.title} ${teacher} ${subject}`.toLowerCase(),
    startedLabel: tone === "live"
      ? `${formatClock(start)} цагаас эхэлсэн`
      : `${formatMonthDay(start)} - ${formatMonthDay(end)}`,
    subject,
    teacher,
    title: exam.title,
  };
};

export const buildStudentHomeViewModel = (data: StudentHomeQuery): StudentHomeViewModel => {
  const nowMs = Date.now();
  const attemptsByExamId = new Map<string, QueryAttempt>();

  for (const attempt of [...data.attempts].sort(
    (a, b) =>
      new Date(b.submittedAt ?? b.startedAt).getTime() -
      new Date(a.submittedAt ?? a.startedAt).getTime(),
  )) {
    if (!attemptsByExamId.has(attempt.exam.id)) attemptsByExamId.set(attempt.exam.id, attempt);
  }

  const liveAttempt = [...attemptsByExamId.values()].find(
    (attempt) => attempt.status === AttemptStatus.InProgress,
  );

  const liveExam = liveAttempt
    ? buildExamCard({ exam: liveAttempt.exam, nowMs, tone: "live" })
    : null;

  const availableExams = data.exams
    .filter((exam) => {
      if (exam.status !== ExamStatus.Published) return false;
      const attempt = attemptsByExamId.get(exam.id);
      return !attempt;
    })
    .map((exam) => buildExamCard({ exam, nowMs, tone: "available" }));

  const completedExams = data.attempts
    .filter((attempt) => attempt.status !== AttemptStatus.InProgress)
    .sort(
      (a, b) =>
        new Date(b.submittedAt ?? b.startedAt).getTime() -
        new Date(a.submittedAt ?? a.startedAt).getTime(),
    )
    .map((attempt) => ({
      id: attempt.id,
      scoreLabel:
        attempt.status === AttemptStatus.Graded
          ? `${attempt.totalScore} оноо`
          : "Pending",
      scoreTone:
        attempt.status === AttemptStatus.Graded ? "text-[#31AA40]" : "text-[#E17100]",
      searchText: `${attempt.exam.title} ${attempt.exam.class.subject} ${attempt.exam.class.teacher.fullName}`.toLowerCase(),
      statusLabel:
        attempt.status === AttemptStatus.Graded ? "Graded" : "Pending Review",
      statusTone:
        attempt.status === AttemptStatus.Graded
          ? "border-[#31AA4033] bg-[#31AA401A] text-[#31AA40]"
          : "border-[rgba(254,154,0,0.3)] bg-[rgba(254,154,0,0.1)] text-[#E17100]",
      subject: attempt.exam.class.subject || attempt.exam.class.name,
      title: attempt.exam.title,
    }));

  return {
    availableExams,
    classIds: data.me?.classes.map((classroom) => classroom.id) ?? [],
    completedExams,
    liveExam,
  };
};
