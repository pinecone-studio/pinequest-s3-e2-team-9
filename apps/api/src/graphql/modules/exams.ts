import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import {
  makeId,
  now,
  type AddQuestionToExamArgs,
  type CloseExamArgs,
  type ByIdArgs,
  type CreateExamArgs,
  type ExamQuestionRow,
  type ExamRow,
  type PublishExamArgs,
  type QuestionRow,
  type Role,
  type UserRow,
} from "../types";

export const findExamById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<ExamRow> => {
  const exam = await first<ExamRow>(
    db,
    `SELECT
      id,
      class_id,
      title,
      description,
      mode,
      status,
      duration_minutes,
      created_by_id,
      scheduled_for,
      created_at
    FROM exams
    WHERE id = ?`,
    [id],
  );
  invariant(exam, `Exam ${id} not found`);
  return exam;
};

type ExamModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (db: D1DatabaseLike, roles: Role[]) => Promise<UserRow>;
  findClass: (db: D1DatabaseLike, id: string) => Promise<{ id: string }>;
  findQuestion: (db: D1DatabaseLike, id: string) => Promise<QuestionRow>;
  toExam: (db: D1DatabaseLike, exam: ExamRow) => unknown;
};

export const createExamQueriesAndMutations = ({
  db,
  requireActor,
  findClass,
  findQuestion,
  toExam,
}: ExamModuleDependencies) => ({
  exams: async () => {
    const rows = await all<ExamRow>(
      db,
      `SELECT
        id,
        class_id,
      title,
      description,
      mode,
      status,
      duration_minutes,
      created_by_id,
      scheduled_for,
      created_at
      FROM exams
      ORDER BY created_at DESC`,
    );
    return rows.map((row) => toExam(db, row));
  },
  exam: async ({ id }: ByIdArgs) => {
    const exam = await first<ExamRow>(
      db,
      `SELECT
        id,
        class_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        created_by_id,
        scheduled_for,
        created_at
      FROM exams
      WHERE id = ?`,
      [id],
    );
    return exam ? toExam(db, exam) : null;
  },
  createExam: async ({
    classId,
    title,
    description,
    mode,
    durationMinutes,
    scheduledFor,
  }: CreateExamArgs) => {
    await findClass(db, classId);
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const id = makeId("exam");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO exams (
        id,
        class_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        created_by_id,
        scheduled_for,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        classId,
        title,
        description ?? null,
        mode ?? "SCHEDULED",
        "DRAFT",
        durationMinutes,
        actor.id,
        scheduledFor ?? createdAt,
        createdAt,
      ],
    );

    return toExam(db, await findExamById(db, id));
  },
  addQuestionToExam: async ({ examId, questionId, points }: AddQuestionToExamArgs) => {
    await findExamById(db, examId);
    await findQuestion(db, questionId);

    const existing = await first<ExamQuestionRow>(
      db,
      `SELECT id, exam_id, question_id, points, display_order
       FROM exam_questions
       WHERE exam_id = ? AND question_id = ?`,
      [examId, questionId],
    );
    invariant(!existing, "This question is already attached to the exam.");

    const nextOrder =
      (
        await first<{ next_order: number }>(
          db,
          "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM exam_questions WHERE exam_id = ?",
          [examId],
        )
      )?.next_order ?? 1;

    await run(
      db,
      `INSERT INTO exam_questions (id, exam_id, question_id, points, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [makeId("exam_question"), examId, questionId, points, nextOrder],
    );

    return toExam(db, await findExamById(db, examId));
  },
  publishExam: async ({ examId }: PublishExamArgs) => {
    await findExamById(db, examId);
    await run(db, "UPDATE exams SET status = 'PUBLISHED' WHERE id = ?", [examId]);
    return toExam(db, await findExamById(db, examId));
  },
  closeExam: async ({ examId }: CloseExamArgs) => {
    await findExamById(db, examId);
    await run(db, "UPDATE exams SET status = 'CLOSED' WHERE id = ?", [examId]);
    await run(
      db,
      `UPDATE attempts
       SET status = 'SUBMITTED', submitted_at = COALESCE(submitted_at, ?)
       WHERE exam_id = ? AND status = 'IN_PROGRESS'`,
      [now(), examId],
    );
    return toExam(db, await findExamById(db, examId));
  },
});
