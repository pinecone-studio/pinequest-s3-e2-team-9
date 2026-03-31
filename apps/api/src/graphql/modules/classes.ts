import { all, first, type D1DatabaseLike } from "../../lib/d1";
import type {
  AttemptIntegrityEventType,
  ClassRow,
  ClassStudentStatus,
  ExamRow,
  IntegrityRiskLevel,
  IntegritySeverity,
  UserRow,
} from "../types";

type ClassMetrics = {
  studentCount: number;
  assignedExamCount: number;
  upcomingExamCount: number;
  completedExamCount: number;
  averageScore: number | null;
};

type StudentInsightRow = {
  student_id: string;
  last_active_at: string | null;
  average_score: number | null;
  started_exam_count: number;
  completed_exam_count: number;
};

type StudentIntegrityRow = {
  student_id: string;
  event_type: AttemptIntegrityEventType;
  severity: IntegritySeverity;
  event_count: number;
  last_event_at: string | null;
};

type StudentIntegrityEventRow = {
  student_id: string;
  id: string;
  event_type: AttemptIntegrityEventType;
  severity: IntegritySeverity;
  details_json: string;
  created_at: string;
};

type ExamInsightRow = {
  exam_id: string;
  submitted_count: number;
  total_students: number;
  progress_percent: number;
  average_score: number | null;
  question_count: number;
};

type ClassAnalyticsDependencies = {
  db: D1DatabaseLike;
  classroom: ClassRow;
  findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toExam: (db: D1DatabaseLike, exam: ExamRow) => unknown;
  toUser: (db: D1DatabaseLike, user: UserRow) => unknown;
};

const integritySeverityWeight: Record<IntegritySeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const loadClassMetrics = async (
  db: D1DatabaseLike,
  classId: string,
): Promise<ClassMetrics> => {
  const metrics = await first<ClassMetrics>(
    db,
    `SELECT
      (SELECT COUNT(*) FROM class_students WHERE class_id = ?) AS studentCount,
      (SELECT COUNT(*) FROM exams WHERE class_id = ? AND COALESCE(is_template, 0) = 0) AS assignedExamCount,
      (SELECT COUNT(*) FROM exams WHERE class_id = ? AND COALESCE(is_template, 0) = 0 AND status = 'PUBLISHED') AS upcomingExamCount,
      (SELECT COUNT(*) FROM exams WHERE class_id = ? AND COALESCE(is_template, 0) = 0 AND status = 'CLOSED') AS completedExamCount,
      (
        SELECT ROUND(AVG((a.total_score * 100.0) / totals.total_points), 1)
        FROM attempts a
        JOIN exams e ON e.id = a.exam_id
        JOIN (
          SELECT exam_id, SUM(points) AS total_points
          FROM exam_questions
          GROUP BY exam_id
        ) totals ON totals.exam_id = e.id
        WHERE e.class_id = ? AND COALESCE(e.is_template, 0) = 0 AND a.status IN ('SUBMITTED', 'GRADED') AND totals.total_points > 0
      ) AS averageScore`,
    [classId, classId, classId, classId, classId],
  );

  return metrics ?? {
    studentCount: 0,
    assignedExamCount: 0,
    upcomingExamCount: 0,
    completedExamCount: 0,
    averageScore: null,
  };
};

const resolveStudentStatus = (
  assignedExamCount: number,
  row: StudentInsightRow,
): ClassStudentStatus => {
  if (assignedExamCount > 0 && row.completed_exam_count >= assignedExamCount) {
    return "COMPLETED";
  }

  return row.started_exam_count > 0 ? "IN_PROGRESS" : "NOT_STARTED";
};

const resolveIntegrityRisk = (
  rows: StudentIntegrityRow[],
): IntegrityRiskLevel => {
  if (!rows.length) {
    return "LOW";
  }

  if (rows.some((row) => row.severity === "HIGH")) {
    return "HIGH";
  }

  const weightedScore = rows.reduce(
    (sum, row) => sum + integritySeverityWeight[row.severity] * row.event_count,
    0,
  );

  return weightedScore >= 3 ? "MEDIUM" : "LOW";
};

export const createClassAnalytics = ({
  db,
  classroom,
  findExam,
  findUser,
  toExam,
  toUser,
}: ClassAnalyticsDependencies) => {
  const metricsPromise = loadClassMetrics(db, classroom.id);
  const studentInsightsPromise = all<StudentInsightRow>(
    db,
    `SELECT
      u.id AS student_id,
      MAX(COALESCE(a.submitted_at, a.started_at)) AS last_active_at,
      ROUND(AVG(CASE
        WHEN a.status IN ('SUBMITTED', 'GRADED') AND totals.total_points > 0
        THEN (a.total_score * 100.0) / totals.total_points
      END), 1) AS average_score,
      COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) AS started_exam_count,
      COUNT(DISTINCT CASE WHEN a.status IN ('SUBMITTED', 'GRADED') THEN e.id END) AS completed_exam_count
    FROM class_students cs
    JOIN users u ON u.id = cs.student_id
    LEFT JOIN exams e ON e.class_id = cs.class_id AND COALESCE(e.is_template, 0) = 0
    LEFT JOIN attempts a ON a.exam_id = e.id AND a.student_id = u.id
    LEFT JOIN (
      SELECT exam_id, SUM(points) AS total_points
      FROM exam_questions
      GROUP BY exam_id
    ) totals ON totals.exam_id = e.id
    WHERE cs.class_id = ?
    GROUP BY u.id, u.full_name
    ORDER BY u.full_name ASC`,
    [classroom.id],
  );
  const studentIntegrityPromise = all<StudentIntegrityRow>(
    db,
    `SELECT
      a.student_id AS student_id,
      ie.event_type AS event_type,
      ie.severity AS severity,
      COUNT(*) AS event_count,
      MAX(ie.created_at) AS last_event_at
    FROM attempt_integrity_events ie
    JOIN attempts a ON a.id = ie.attempt_id
    JOIN exams e ON e.id = ie.exam_id
    WHERE e.class_id = ? AND a.status = 'IN_PROGRESS'
    GROUP BY a.student_id, ie.event_type, ie.severity`,
    [classroom.id],
  );
  const studentIntegrityEventsPromise = all<StudentIntegrityEventRow>(
    db,
    `SELECT
      a.student_id AS student_id,
      ie.id AS id,
      ie.event_type AS event_type,
      ie.severity AS severity,
      ie.details_json AS details_json,
      ie.created_at AS created_at
    FROM attempt_integrity_events ie
    JOIN attempts a ON a.id = ie.attempt_id
    JOIN exams e ON e.id = ie.exam_id
    WHERE e.class_id = ? AND a.status = 'IN_PROGRESS'
    ORDER BY ie.created_at DESC`,
    [classroom.id],
  );
  const examInsightsPromise = all<ExamInsightRow>(
    db,
    `SELECT
      e.id AS exam_id,
      COUNT(DISTINCT CASE WHEN a.status IN ('SUBMITTED', 'GRADED') THEN a.student_id END) AS submitted_count,
      COALESCE(students.student_count, 0) AS total_students,
      CASE
        WHEN COALESCE(students.student_count, 0) = 0 THEN 0
        ELSE CAST(ROUND(
          COUNT(DISTINCT CASE WHEN a.status IN ('SUBMITTED', 'GRADED') THEN a.student_id END) * 100.0
          / students.student_count
        ) AS INTEGER)
      END AS progress_percent,
      ROUND(AVG(CASE
        WHEN a.status IN ('SUBMITTED', 'GRADED') AND totals.total_points > 0
        THEN (a.total_score * 100.0) / totals.total_points
      END), 1) AS average_score,
      COALESCE(totals.question_count, 0) AS question_count
    FROM exams e
    LEFT JOIN attempts a ON a.exam_id = e.id
    LEFT JOIN (
      SELECT class_id, COUNT(*) AS student_count
      FROM class_students
      GROUP BY class_id
    ) students ON students.class_id = e.class_id
    LEFT JOIN (
      SELECT exam_id, COUNT(*) AS question_count, SUM(points) AS total_points
      FROM exam_questions
      GROUP BY exam_id
    ) totals ON totals.exam_id = e.id
    WHERE e.class_id = ? AND COALESCE(e.is_template, 0) = 0
    GROUP BY e.id, e.created_at, students.student_count, totals.question_count
    ORDER BY e.created_at DESC`,
    [classroom.id],
  );

  return {
    subject: classroom.subject,
    grade: classroom.grade,
    studentCount: async () => (await metricsPromise).studentCount,
    assignedExamCount: async () => (await metricsPromise).assignedExamCount,
    upcomingExamCount: async () => (await metricsPromise).upcomingExamCount,
    completedExamCount: async () => (await metricsPromise).completedExamCount,
    averageScore: async () => (await metricsPromise).averageScore,
    studentInsights: async () => {
      const [metrics, studentRows, integrityRows, integrityEvents] = await Promise.all([
        metricsPromise,
        studentInsightsPromise,
        studentIntegrityPromise,
        studentIntegrityEventsPromise,
      ]);

      const integrityRowsByStudent = integrityRows.reduce<Map<string, StudentIntegrityRow[]>>(
        (current, row) => {
          const next = current.get(row.student_id) ?? [];
          next.push(row);
          current.set(row.student_id, next);
          return current;
        },
        new Map(),
      );
      const integrityEventsByStudent = integrityEvents.reduce<Map<string, StudentIntegrityEventRow[]>>(
        (current, row) => {
          const next = current.get(row.student_id) ?? [];
          next.push(row);
          current.set(row.student_id, next);
          return current;
        },
        new Map(),
      );

      return Promise.all(
        studentRows.map(async (row) => {
          const integritySignals = (integrityRowsByStudent.get(row.student_id) ?? [])
            .slice()
            .sort(
              (left, right) =>
                integritySeverityWeight[right.severity] - integritySeverityWeight[left.severity]
                || right.event_count - left.event_count
                || (right.last_event_at ?? "").localeCompare(left.last_event_at ?? ""),
            );

          const lastIntegrityEventAt =
            integritySignals
              .map((entry) => entry.last_event_at)
              .filter((value): value is string => Boolean(value))[0] ?? null;
          const studentIntegrityEvents =
            integrityEventsByStudent.get(row.student_id) ?? [];

          return {
            student: toUser(db, await findUser(db, row.student_id)),
            status: resolveStudentStatus(metrics.assignedExamCount, row),
            lastActiveAt: row.last_active_at,
            averageScore: row.average_score,
            suspiciousEventCount: integritySignals.reduce(
              (sum, entry) => sum + entry.event_count,
              0,
            ),
            integrityRisk: resolveIntegrityRisk(integritySignals),
            lastIntegrityEventAt,
            integritySignals: integritySignals.map((entry) => ({
              type: entry.event_type,
              severity: entry.severity,
              count: entry.event_count,
            })),
            integrityEvents: studentIntegrityEvents.map((entry) => ({
              id: entry.id,
              type: entry.event_type,
              severity: entry.severity,
              details: entry.details_json,
              createdAt: entry.created_at,
            })),
          };
        }),
      );
    },
    examInsights: async () =>
      Promise.all(
        (await examInsightsPromise).map(async (row) => ({
          exam: toExam(db, await findExam(db, row.exam_id)),
          submittedCount: row.submitted_count,
          totalStudents: row.total_students,
          progressPercent: row.progress_percent,
          averageScore: row.average_score,
          questionCount: row.question_count,
        })),
      ),
  };
};
