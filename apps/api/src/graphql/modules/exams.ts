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
  type ExamMode,
  type ExamRow,
  type PublishExamArgs,
  type QuestionRow,
  type Role,
  type UpdateExamDraftArgs,
  type UserRow,
} from "../types";
import { findQuestionBankById } from "./questions";

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
      generation_mode,
      rules_json,
      passing_criteria_type,
      passing_threshold,
      created_at`;

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const stableShuffle = <T,>(items: T[], seed: string, getKey: (item: T) => string) =>
  items
    .map((item, index) => ({
      item,
      index,
      rank: hashString(`${seed}:${getKey(item)}:${index}`),
    }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map(({ item }) => item);

const normalizeExamRules = (rules: CreateExamArgs["rules"]) =>
  (rules ?? []).map((rule) => ({
    label: rule.label,
    bankIds: rule.bankIds,
    difficulty: rule.difficulty ?? null,
    count: rule.count,
    points: rule.points,
  }));

const insertExamQuestions = async (
  db: D1DatabaseLike,
  examId: string,
  items: Array<{ questionId: string; points: number }>,
) => {
  for (const [index, item] of items.entries()) {
    await run(
      db,
      `INSERT INTO exam_questions (id, exam_id, question_id, points, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [makeId("exam_question"), examId, item.questionId, item.points, index + 1],
    );
  }
};

export const appendQuestionToExam = async (
  db: D1DatabaseLike,
  examId: string,
  questionId: string,
  points: number,
) => {
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
};

const replaceExamQuestions = async (
  db: D1DatabaseLike,
  examId: string,
  items: Array<{ questionId: string; points: number }>,
) => {
  await run(db, "DELETE FROM exam_questions WHERE exam_id = ?", [examId]);
  await insertExamQuestions(db, examId, items);
};

const buildRuleBasedQuestions = async ({
  actor,
  db,
  examId,
  mode,
  rules,
}: {
  actor: UserRow;
  db: D1DatabaseLike;
  examId: string;
  mode: ExamMode;
  rules: ReturnType<typeof normalizeExamRules>;
}) => {
  const usedQuestionIds = new Set<string>();
  const selected: Array<{ questionId: string; points: number }> = [];

  for (const [index, rule] of rules.entries()) {
    invariant(rule.count > 0, "Rule бүрийн асуултын тоо 1-ээс их байна.");
    invariant(rule.points > 0, "Rule бүрийн оноо 1-ээс их байна.");

    invariant(rule.bankIds.length > 0, "Rule бүр дор хаяж нэг сантай байна.");

    for (const bankId of rule.bankIds) {
      const bank = await findQuestionBankById(db, bankId);
      if (actor.role === "TEACHER") {
        invariant(
          bank.visibility === "PUBLIC" || bank.owner_id === actor.id,
          "Зөвхөн өөрийн эсвэл нээлттэй сангаас rule ашиглана.",
        );
      }
    }

    const placeholders = rule.bankIds.map(() => "?").join(", ");
    const rows = await all<QuestionRow>(
      db,
      `SELECT
        id,
        bank_id,
        type,
        title,
        prompt,
        options_json,
        correct_answer,
        difficulty,
        tags_json,
        created_by_id,
        created_at
      FROM questions
      WHERE bank_id IN (${placeholders})
        AND (? != 'PRACTICE' OR type NOT IN ('ESSAY', 'IMAGE_UPLOAD'))
        AND (? IS NULL OR difficulty = ?)
      ORDER BY created_at DESC`,
      [...rule.bankIds, mode, rule.difficulty, rule.difficulty],
    );

    const availableRows = rows.filter((row) => !usedQuestionIds.has(row.id));
    invariant(
      availableRows.length >= rule.count,
      `${rule.label} сэдвээс ${rule.count} асуулт бүрдүүлэхэд хүрэлцэхгүй байна.`,
    );

    const picked = stableShuffle(
      availableRows,
      `${examId}:${rule.bankIds.join("|")}:${rule.difficulty ?? "ALL"}:${index}`,
      (row) => row.id,
    ).slice(0, rule.count);

    for (const row of picked) {
      usedQuestionIds.add(row.id);
      selected.push({ questionId: row.id, points: rule.points });
    }
  }

  return selected;
};

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
              LEFT JOIN class_students cs
                ON cs.class_id = e.class_id AND cs.student_id = ?
              WHERE COALESCE(e.is_template, 0) = 0
                AND (
                  cs.student_id IS NOT NULL
                  OR (e.mode = 'PRACTICE' AND e.status = 'PUBLISHED')
                )
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
              LEFT JOIN class_students cs
                ON cs.class_id = e.class_id AND cs.student_id = ?
              WHERE COALESCE(e.is_template, 0) = 0
                AND e.id = ?
                AND (
                  cs.student_id IS NOT NULL
                  OR (e.mode = 'PRACTICE' AND e.status = 'PUBLISHED')
                )`,
              [actor.id, id],
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
      generationMode,
      rules,
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
    const normalizedRules = normalizeExamRules(rules);

    if ((generationMode ?? "MANUAL") === "RULE_BASED") {
      invariant(normalizedRules.length > 0, "Rule-based шалгалтад дор хаяж нэг rule хэрэгтэй.");
    }

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
        generation_mode,
        rules_json,
        passing_criteria_type,
        passing_threshold,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        generationMode ?? "MANUAL",
        JSON.stringify(normalizedRules),
        passingCriteriaType ?? "PERCENTAGE",
        passingThreshold ?? 40,
        createdAt,
      ],
    );

    if ((generationMode ?? "MANUAL") === "RULE_BASED") {
      const selectedQuestions = await buildRuleBasedQuestions({
        actor,
        db,
        examId: id,
        mode: mode ?? "SCHEDULED",
        rules: normalizedRules,
      });
      await insertExamQuestions(db, id, selectedQuestions);
    }

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
        generation_mode,
        rules_json,
        passing_criteria_type,
        passing_threshold,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        sourceExam.generation_mode,
        sourceExam.rules_json,
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

    const assignedExam = await findExamById(db, nextExamId);
    await publishLiveEvent?.({
      type: "exam_assigned",
      classId,
      endsAt: null,
      emittedAt: now(),
      examId: assignedExam.id,
      startedAt: null,
      status: "DRAFT",
      title: assignedExam.title,
    });

    return toExam(db, assignedExam);
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

    await appendQuestionToExam(db, examId, questionId, points);

    return toExam(db, await findExamById(db, examId));
  },
  updateExamDraft: async (
    {
      examId,
      classId,
      title,
      description,
      mode,
      durationMinutes,
      scheduledFor,
      shuffleQuestions,
      shuffleAnswers,
      generationMode,
      rules,
      passingCriteriaType,
      passingThreshold,
      questionItems,
    }: UpdateExamDraftArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    invariant(exam.status === "DRAFT", "Зөвхөн draft шалгалтыг засварлаж болно.");

    const currentClass = await findClass(db, exam.class_id);
    const nextClass = await findClass(db, classId);
    if (actor.role === "TEACHER") {
      invariant(
        currentClass.teacher_id === actor.id && nextClass.teacher_id === actor.id,
        "You can only edit draft exams for your own classes.",
      );
    }

    const normalizedRules = normalizeExamRules(rules);
    if ((generationMode ?? "MANUAL") === "RULE_BASED") {
      invariant(normalizedRules.length > 0, "Rule-based шалгалтад дор хаяж нэг rule хэрэгтэй.");
    } else {
      invariant((questionItems?.length ?? 0) > 0, "Гараар сонгосон дор хаяж нэг асуулт байна.");
      const seenQuestionIds = new Set<string>();
      for (const item of questionItems ?? []) {
        invariant(item.points > 0, "Асуултын оноо 1-ээс их байна.");
        invariant(!seenQuestionIds.has(item.questionId), "Давхардсан асуулт илэрлээ.");
        seenQuestionIds.add(item.questionId);
        await findQuestion(db, item.questionId);
      }
    }

    await run(
      db,
      `UPDATE exams
       SET class_id = ?,
           title = ?,
           description = ?,
           mode = ?,
           duration_minutes = ?,
           scheduled_for = ?,
           shuffle_questions = ?,
           shuffle_answers = ?,
           generation_mode = ?,
           rules_json = ?,
           passing_criteria_type = ?,
           passing_threshold = ?
       WHERE id = ?`,
      [
        classId,
        title,
        description ?? null,
        mode ?? "SCHEDULED",
        durationMinutes,
        scheduledFor ?? now(),
        shuffleQuestions ? 1 : 0,
        shuffleAnswers ? 1 : 0,
        generationMode ?? "MANUAL",
        JSON.stringify(normalizedRules),
        passingCriteriaType ?? "PERCENTAGE",
        passingThreshold ?? 40,
        examId,
      ],
    );

    const nextItems =
      (generationMode ?? "MANUAL") === "RULE_BASED"
        ? await buildRuleBasedQuestions({
            actor,
            db,
            examId,
            mode: mode ?? exam.mode,
            rules: normalizedRules,
          })
        : (questionItems ?? []).map((item) => ({
            questionId: item.questionId,
            points: item.points,
          }));

    await replaceExamQuestions(db, examId, nextItems);

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
