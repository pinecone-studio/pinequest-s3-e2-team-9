import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import {
  type AssignExamToClassArgs,
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

const getExamEndTimestamp = (startedAt: string, durationMinutes: number): string => {
  const startedAtMs = Date.parse(startedAt);
  return new Date(startedAtMs + durationMinutes * 60_000).toISOString();
};

export const closeExpiredExams = async (db: D1DatabaseLike): Promise<void> => {
  const currentTime = now();
  await run(
    db,
    `UPDATE exams
     SET status = 'CLOSED', ends_at = COALESCE(ends_at, ?)
     WHERE status = 'PUBLISHED' AND ends_at IS NOT NULL AND ends_at <= ?`,
    [currentTime, currentTime],
  );
};

export const findExamById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<ExamRow> => {
  await closeExpiredExams(db);
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
      started_at,
      ends_at,
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
    await closeExpiredExams(db);
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
        started_at,
        ends_at,
        created_by_id,
        scheduled_for,
        created_at
      FROM exams
      ORDER BY created_at DESC`,
    );
    return rows.map((row) => toExam(db, row));
  },
  exam: async ({ id }: ByIdArgs) => {
    await closeExpiredExams(db);
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
        started_at,
        ends_at,
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
        started_at,
        ends_at,
        created_by_id,
        scheduled_for,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        classId,
        title,
        description ?? null,
        mode ?? "SCHEDULED",
        "DRAFT",
        durationMinutes,
        null,
        null,
        actor.id,
        scheduledFor ?? createdAt,
        createdAt,
      ],
    );

    return toExam(db, await findExamById(db, id));
  },
  assignExamToClass: async ({ examId, classId }: AssignExamToClassArgs) => {
    await findClass(db, classId);
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const sourceExam = await findExamById(db, examId);
    invariant(
      sourceExam.class_id !== classId,
      "Энэ шалгалт сонгосон ангид аль хэдийн харьяалагдаж байна.",
    );

    const nextExamId = makeId("exam");
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
        started_at,
        ends_at,
        created_by_id,
        scheduled_for,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextExamId,
        classId,
        sourceExam.title,
        sourceExam.description,
        sourceExam.mode,
        "DRAFT",
        sourceExam.duration_minutes,
        null,
        null,
        actor.id,
        sourceExam.scheduled_for,
        createdAt,
      ],
    );

    const sourceQuestions = await all<ExamQuestionRow>(
      db,
      `SELECT id, exam_id, question_id, points, display_order
       FROM exam_questions
       WHERE exam_id = ?
       ORDER BY display_order ASC`,
      [examId],
    );

    for (const question of sourceQuestions) {
      await run(
        db,
        `INSERT INTO exam_questions (id, exam_id, question_id, points, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [
          makeId("exam_question"),
          nextExamId,
          question.question_id,
          question.points,
          question.display_order,
        ],
      );
    }

    return toExam(db, await findExamById(db, nextExamId));
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
    const exam = await findExamById(db, examId);
    invariant(exam.status === "DRAFT", "Only draft exams can be started.");
    const startedAt = now();
    const endsAt = getExamEndTimestamp(startedAt, exam.duration_minutes);
    await run(
      db,
      "UPDATE exams SET status = 'PUBLISHED', started_at = ?, ends_at = ? WHERE id = ?",
      [startedAt, endsAt, examId],
    );
    return toExam(db, await findExamById(db, examId));
  },
  closeExam: async ({ examId }: CloseExamArgs) => {
    const exam = await findExamById(db, examId);
    if (exam.status !== "CLOSED") {
      await run(
        db,
        "UPDATE exams SET status = 'CLOSED', ends_at = COALESCE(ends_at, ?) WHERE id = ?",
        [now(), examId],
      );
    }
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
