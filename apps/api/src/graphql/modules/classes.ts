import { all, first, type D1DatabaseLike } from "../../lib/d1";
import type { ClassRow, ClassStudentStatus, ExamRow, UserRow } from "../types";

type ClassMetrics = { studentCount: number; assignedExamCount: number; upcomingExamCount: number; completedExamCount: number; averageScore: number | null };
type StudentInsightRow = { student_id: string; last_active_at: string | null; average_score: number | null; started_exam_count: number; completed_exam_count: number };
type ExamInsightRow = { exam_id: string; submitted_count: number; total_students: number; progress_percent: number; average_score: number | null; question_count: number };
type ClassAnalyticsDependencies = { db: D1DatabaseLike; classroom: ClassRow; findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>; findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>; toExam: (db: D1DatabaseLike, exam: ExamRow) => unknown; toUser: (db: D1DatabaseLike, user: UserRow) => unknown };

const loadClassMetrics = async (
  db: D1DatabaseLike,
  classId: string,
): Promise<ClassMetrics> => {
  const metrics = await first<ClassMetrics>(
    db,
    `SELECT
      (SELECT COUNT(*) FROM class_students WHERE class_id = ?) AS studentCount,
      (SELECT COUNT(*) FROM exams WHERE class_id = ?) AS assignedExamCount,
      (SELECT COUNT(*) FROM exams WHERE class_id = ? AND status = 'PUBLISHED') AS upcomingExamCount,
      (SELECT COUNT(*) FROM exams WHERE class_id = ? AND status = 'CLOSED') AS completedExamCount,
      (
        SELECT ROUND(AVG((a.total_score * 100.0) / totals.total_points), 1)
        FROM attempts a
        JOIN exams e ON e.id = a.exam_id
        JOIN (
          SELECT exam_id, SUM(points) AS total_points
          FROM exam_questions
          GROUP BY exam_id
        ) totals ON totals.exam_id = e.id
        WHERE e.class_id = ? AND a.status IN ('SUBMITTED', 'GRADED') AND totals.total_points > 0
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
    LEFT JOIN exams e ON e.class_id = cs.class_id
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
    WHERE e.class_id = ?
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
      const [metrics, rows] = await Promise.all([
        metricsPromise,
        studentInsightsPromise,
      ]);
      return Promise.all(
        rows.map(async (row) => ({
          student: toUser(db, await findUser(db, row.student_id)),
          status: resolveStudentStatus(metrics.assignedExamCount, row),
          lastActiveAt: row.last_active_at,
          averageScore: row.average_score,
        })),
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
