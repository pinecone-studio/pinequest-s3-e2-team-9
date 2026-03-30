import { all, first, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import type { Role, UserRow } from "../types";

type CountRow = { count: number | null };
type ClassIdRow = { id: string };
type UpcomingExamRow = {
  id: string;
  title: string;
  scheduled_for: string;
  question_count: number | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
};
type RecentResultRow = {
  id: string;
  title: string;
  attempt_count: number | null;
  pass_count: number | null;
  fail_count: number | null;
  average_score_percent: number | null;
};

const toSafeCount = (value: number | null | undefined): number => value ?? 0;

type DashboardModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
};

export const createDashboardOverviewQuery = ({
  db,
  requireActor,
}: DashboardModuleDependencies) => ({
  dashboardOverview: async (_args: unknown, context: RequestContext) => {
    const actor = await requireActor(context, ["TEACHER"]);
    const teacherId = actor.id;
    const nowIso = new Date().toISOString();

    const [
      classRows,
      pendingReview,
      draftExam,
      ongoingExam,
      scheduledExam,
      upcomingExams,
      recentResults,
    ] =
      await Promise.all([
        all<ClassIdRow>(
          db,
          `SELECT id
           FROM classes
           WHERE teacher_id = ?
           ORDER BY created_at DESC`,
          [teacherId],
        ),
        first<CountRow>(
          db,
          `SELECT COUNT(*) AS count
           FROM attempts a
           JOIN exams e ON e.id = a.exam_id
           JOIN classes c ON c.id = e.class_id
           WHERE c.teacher_id = ? AND a.status = 'SUBMITTED'`,
          [teacherId],
        ),
        first<CountRow>(
          db,
          `SELECT COUNT(*) AS count
           FROM exams e
           JOIN classes c ON c.id = e.class_id
           WHERE c.teacher_id = ? AND COALESCE(e.is_template, 0) = 1 AND e.status = 'DRAFT'`,
          [teacherId],
        ),
        first<CountRow>(
          db,
          `SELECT COUNT(*) AS count
           FROM exams e
           JOIN classes c ON c.id = e.class_id
           WHERE c.teacher_id = ?
             AND COALESCE(e.is_template, 0) = 0
             AND e.status = 'PUBLISHED'
             AND EXISTS (
               SELECT 1
               FROM attempts a
               WHERE a.exam_id = e.id AND a.status = 'IN_PROGRESS'
             )`,
          [teacherId],
        ),
        first<CountRow>(
          db,
          `SELECT COUNT(*) AS count
           FROM exams e
           JOIN classes c ON c.id = e.class_id
           WHERE c.teacher_id = ?
             AND COALESCE(e.is_template, 0) = 0
             AND e.status != 'CLOSED'
             AND COALESCE(e.scheduled_for, e.created_at) >= ?`,
          [teacherId, nowIso],
        ),
        all<UpcomingExamRow>(
          db,
          `SELECT
             e.id,
             e.title,
             COALESCE(e.scheduled_for, e.created_at) AS scheduled_for,
             e.status,
             COUNT(eq.id) AS question_count
           FROM exams e
           JOIN classes c ON c.id = e.class_id
           LEFT JOIN exam_questions eq ON eq.exam_id = e.id
           WHERE c.teacher_id = ?
             AND COALESCE(e.is_template, 0) = 0
             AND e.status != 'CLOSED'
             AND COALESCE(e.scheduled_for, e.created_at) >= ?
           GROUP BY e.id, e.title, e.status, scheduled_for
           ORDER BY scheduled_for ASC
           LIMIT 4`,
          [teacherId, nowIso],
        ),
        all<RecentResultRow>(
          db,
          `SELECT
             e.id,
             e.title,
             COUNT(a.id) AS attempt_count,
             SUM(
               CASE
                 WHEN totals.max_score <= 0 THEN 0
                 WHEN e.passing_criteria_type = 'POINTS' AND a.total_score >= e.passing_threshold THEN 1
                 WHEN e.passing_criteria_type = 'PERCENTAGE' AND a.total_score * 100 >= totals.max_score * e.passing_threshold THEN 1
                 ELSE 0
               END
             ) AS pass_count,
             SUM(
               CASE
                 WHEN totals.max_score <= 0 THEN 0
                 WHEN e.passing_criteria_type = 'POINTS' AND a.total_score < e.passing_threshold THEN 1
                 WHEN e.passing_criteria_type = 'PERCENTAGE' AND a.total_score * 100 < totals.max_score * e.passing_threshold THEN 1
                 ELSE 0
               END
             ) AS fail_count,
             ROUND(
               AVG(
                 CASE
                   WHEN totals.max_score > 0 THEN (CAST(a.total_score AS REAL) / totals.max_score) * 100
                   ELSE 0
                 END
               )
             ) AS average_score_percent
           FROM exams e
           JOIN classes c ON c.id = e.class_id
           JOIN (
             SELECT exam_id, COALESCE(SUM(points), 0) AS max_score
             FROM exam_questions
             GROUP BY exam_id
           ) totals ON totals.exam_id = e.id
           LEFT JOIN attempts a
             ON a.exam_id = e.id
            AND a.status IN ('SUBMITTED', 'GRADED')
           WHERE c.teacher_id = ?
             AND COALESCE(e.is_template, 0) = 0
             AND e.status = 'CLOSED'
           GROUP BY e.id, e.title, totals.max_score
           HAVING COUNT(a.id) > 0
           ORDER BY MAX(COALESCE(a.submitted_at, a.started_at)) DESC
           LIMIT 4`,
          [teacherId],
        ),
      ]);

    return {
      teacherName: actor.full_name,
      classIds: classRows.map((classroom) => classroom.id),
      summary: {
        pendingReviewCount: toSafeCount(pendingReview?.count),
        draftExamCount: toSafeCount(draftExam?.count),
        ongoingExamCount: toSafeCount(ongoingExam?.count),
        scheduledExamCount: toSafeCount(scheduledExam?.count),
      },
      upcomingExams: upcomingExams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        scheduledFor: exam.scheduled_for,
        questionCount: toSafeCount(exam.question_count),
        status: exam.status,
      })),
      recentResults: recentResults.map((exam) => {
        const attemptCount = Math.max(1, toSafeCount(exam.attempt_count));
        const passCount = toSafeCount(exam.pass_count);
        return {
          id: exam.id,
          title: exam.title,
          passCount,
          failCount: toSafeCount(exam.fail_count),
          progressPercent: Math.round((passCount / attemptCount) * 100),
          averageScorePercent: toSafeCount(exam.average_score_percent),
        };
      }),
    };
  },
});
