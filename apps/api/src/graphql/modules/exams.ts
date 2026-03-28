import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import type { LiveExamMutationEvent } from "../../live-exam-events";
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

const examSelectFields = `id,
      class_id,
      is_template,
      source_exam_id,
      title,
      description,
      mode,
      status,
      duration_minutes,
      started_at,
      ends_at,
      created_by_id,
      scheduled_for,
      shuffle_questions,
      shuffle_answers,
      passing_criteria_type,
      passing_threshold,
      created_at`;

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
      ${examSelectFields}
    FROM exams
    WHERE id = ?`,
    [id],
  );
  invariant(exam, `Exam ${id} not found`);
  return exam;
};

type ExamModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  findClass: (db: D1DatabaseLike, id: string) => Promise<{ id: string; teacher_id: string }>;
  findQuestion: (db: D1DatabaseLike, id: string) => Promise<QuestionRow>;
  publishLiveEvent?: (event: LiveExamMutationEvent) => Promise<void>;
  toExam: (db: D1DatabaseLike, exam: ExamRow) => unknown;
};

export const createExamQueriesAndMutations = ({
  db,
  requireActor,
  findClass,
  findQuestion,
  publishLiveEvent,
  toExam,
}: ExamModuleDependencies) => ({
  exams: async (_args: unknown, context: RequestContext) => {
    await closeExpiredExams(db);
    const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
    const rows =
      actor.role === "ADMIN"
        ? await all<ExamRow>(
            db,
            `SELECT
              ${examSelectFields}
            FROM exams
            ORDER BY created_at DESC`,
          )
        : actor.role === "TEACHER"
          ? await all<ExamRow>(
            db,
            `SELECT
                e.${examSelectFields.replaceAll(",\n      ", ",\n                e.")}
              FROM exams e
              JOIN classes c ON c.id = e.class_id
              WHERE c.teacher_id = ?
              ORDER BY e.created_at DESC`,
              [actor.id],
            )
          : await all<ExamRow>(
              db,
              `SELECT DISTINCT
                e.${examSelectFields.replaceAll(",\n      ", ",\n                e.")}
              FROM exams e
              JOIN class_students cs ON cs.class_id = e.class_id
              WHERE COALESCE(e.is_template, 0) = 0 AND cs.student_id = ?
              ORDER BY e.created_at DESC`,
              [actor.id],
            );
    return rows.map((row) => toExam(db, row));
  },
  exam: async ({ id }: ByIdArgs, context: RequestContext) => {
    await closeExpiredExams(db);
    const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
    const exam =
      actor.role === "ADMIN"
        ? await first<ExamRow>(
            db,
            `SELECT
              ${examSelectFields}
            FROM exams
            WHERE id = ?`,
            [id],
          )
        : actor.role === "TEACHER"
          ? await first<ExamRow>(
              db,
              `SELECT
                e.${examSelectFields.replaceAll(",\n      ", ",\n                e.")}
              FROM exams e
              JOIN classes c ON c.id = e.class_id
              WHERE e.id = ? AND c.teacher_id = ?`,
              [id, actor.id],
            )
          : await first<ExamRow>(
              db,
              `SELECT DISTINCT
                e.${examSelectFields.replaceAll(",\n      ", ",\n                e.")}
              FROM exams e
              JOIN class_students cs ON cs.class_id = e.class_id
              WHERE COALESCE(e.is_template, 0) = 0 AND e.id = ? AND cs.student_id = ?`,
              [id, actor.id],
            );
    return exam ? toExam(db, exam) : null;
  },
  createExam: async (
    {
      classId,
      title,
      description,
      mode,
      durationMinutes,
      scheduledFor,
      shuffleQuestions,
      shuffleAnswers,
      passingCriteriaType,
      passingThreshold,
    }: CreateExamArgs,
    context: RequestContext,
  ) => {
    const classroom = await findClass(db, classId);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    if (actor.role === "TEACHER") {
      invariant(
        classroom.teacher_id === actor.id,
        "You can only create exams for your own classes.",
      );
    }
    const id = makeId("exam");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO exams (
        id,
        class_id,
        is_template,
        source_exam_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        started_at,
        ends_at,
        created_by_id,
        scheduled_for,
        shuffle_questions,
        shuffle_answers,
        passing_criteria_type,
        passing_threshold,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        classId,
        1,
        null,
        title,
        description ?? null,
        mode ?? "SCHEDULED",
        "DRAFT",
        durationMinutes,
        null,
        null,
        actor.id,
        scheduledFor ?? createdAt,
        shuffleQuestions ? 1 : 0,
        shuffleAnswers ? 1 : 0,
        passingCriteriaType ?? "PERCENTAGE",
        passingThreshold ?? 40,
        createdAt,
      ],
    );

    return toExam(db, await findExamById(db, id));
  },
  assignExamToClass: async (
    { examId, classId }: AssignExamToClassArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const targetClass = await findClass(db, classId);
    if (actor.role === "TEACHER") {
      invariant(
        targetClass.teacher_id === actor.id,
        "You can only assign exams to your own classes.",
      );
    }

    const sourceExam = await findExamById(db, examId);
    invariant(sourceExam.is_template === 1, "Зөвхөн ноорог шалгалтыг ангид оноож болно.");
    if (actor.role === "TEACHER") {
      const sourceClass = await findClass(db, sourceExam.class_id);
      invariant(
        sourceClass.teacher_id === actor.id,
        "You can only assign exams that belong to your own classes.",
      );
    }

    const nextExamId = makeId("exam");
    const createdAt = now();
    await run(
      db,
      `INSERT INTO exams (
        id,
        class_id,
        is_template,
        source_exam_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        started_at,
        ends_at,
        created_by_id,
        scheduled_for,
        shuffle_questions,
        shuffle_answers,
        passing_criteria_type,
        passing_threshold,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextExamId,
        classId,
        0,
        sourceExam.source_exam_id ?? sourceExam.id,
        sourceExam.title,
        sourceExam.description,
        sourceExam.mode,
        "DRAFT",
        sourceExam.duration_minutes,
        null,
        null,
        actor.id,
        sourceExam.scheduled_for,
        sourceExam.shuffle_questions,
        sourceExam.shuffle_answers,
        sourceExam.passing_criteria_type,
        sourceExam.passing_threshold,
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
  addQuestionToExam: async (
    { examId, questionId, points }: AddQuestionToExamArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    if (actor.role === "TEACHER") {
      const classroom = await findClass(db, exam.class_id);
      invariant(
        classroom.teacher_id === actor.id,
        "You can only edit exams for your own classes.",
      );
    }
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
  publishExam: async ({ examId }: PublishExamArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    invariant(!exam.is_template, "Template шалгалтыг ангид оноосны дараа эхлүүлнэ үү.");
    if (actor.role === "TEACHER") {
      const classroom = await findClass(db, exam.class_id);
      invariant(
        classroom.teacher_id === actor.id,
        "You can only publish exams for your own classes.",
      );
    }
    invariant(exam.status === "DRAFT", "Only draft exams can be started.");
    const startedAt = now();
    const endsAt = getExamEndTimestamp(startedAt, exam.duration_minutes);
    await run(
      db,
      "UPDATE exams SET status = 'PUBLISHED', started_at = ?, ends_at = ? WHERE id = ?",
      [startedAt, endsAt, examId],
    );
    const publishedExam = await findExamById(db, examId);
    await publishLiveEvent?.({
      type: "exam_published",
      classId: publishedExam.class_id,
      endsAt: publishedExam.ends_at,
      emittedAt: now(),
      examId: publishedExam.id,
      startedAt: publishedExam.started_at,
      status: "PUBLISHED",
      title: publishedExam.title,
    });
    return toExam(db, publishedExam);
  },
  closeExam: async ({ examId }: CloseExamArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    invariant(!exam.is_template, "Template шалгалтыг шууд хаах боломжгүй.");
    if (actor.role === "TEACHER") {
      const classroom = await findClass(db, exam.class_id);
      invariant(
        classroom.teacher_id === actor.id,
        "You can only close exams for your own classes.",
      );
    }
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
    const closedExam = await findExamById(db, examId);
    await publishLiveEvent?.({
      type: "exam_closed",
      classId: closedExam.class_id,
      endsAt: closedExam.ends_at,
      emittedAt: now(),
      examId: closedExam.id,
      startedAt: closedExam.started_at,
      status: "CLOSED",
      title: closedExam.title,
    });
    return toExam(db, closedExam);
  },
});
