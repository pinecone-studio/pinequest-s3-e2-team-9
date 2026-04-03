import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import type { LiveExamMutationEvent } from "../../live-exam-events";
import {
  type AssignExamToClassArgs,
  makeId,
  now,
  type AddQuestionToExamArgs,
  type CloseExamArgs,
  type DeleteExamArgs,
  type ByIdArgs,
  type CreateExamArgs,
  type ExamDiagnosticConfig,
  type QuestionBankRow,
  type ExamQuestionRow,
  type ExamMode,
  type ExamRow,
  type PublishExamArgs,
  parseJsonArray,
  type QuestionRepositoryFilter,
  type QuestionRow,
  type Role,
  type UpdateExamDraftArgs,
  type UserRow,
} from "../types";
import { findQuestionBankById } from "./questions";
import { canActorUseQuestion } from "./questions";

const fullQuestionSelectFields = `id,
      bank_id,
      canonical_question_id,
      forked_from_question_id,
      type,
      title,
      prompt,
      options_json,
      correct_answer,
      difficulty,
      share_scope,
      requires_access_request,
      tags_json,
      created_by_id,
      created_at`;

const legacyQuestionSelectFields = `id,
      bank_id,
      type,
      title,
      prompt,
      options_json,
      correct_answer,
      difficulty,
      tags_json,
      created_by_id,
      created_at`;

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

const isMissingQuestionSharingColumnError = (error: unknown) =>
  error instanceof Error &&
  /no such column: (?:[a-z_]+\.)?(canonical_question_id|forked_from_question_id|share_scope|requires_access_request)/i.test(
    error.message,
  );

const isMissingQuestionAccessRequestsTableError = (error: unknown) =>
  error instanceof Error &&
  /no such table:\s*question_access_requests/i.test(error.message);

const toCompatQuestionRow = (
  row: Omit<QuestionRow, "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"> &
    Partial<
      Pick<
        QuestionRow,
        "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"
      >
    >,
): QuestionRow => ({
  ...row,
  canonical_question_id: row.canonical_question_id ?? row.id,
  forked_from_question_id: row.forked_from_question_id ?? null,
  share_scope: row.share_scope ?? "PRIVATE",
  requires_access_request: row.requires_access_request ?? 0,
});

const allQuestionsCompat = async (
  db: D1DatabaseLike,
  fullSql: string,
  legacySql: string,
  params: unknown[],
) => {
  try {
    return await all<QuestionRow>(db, fullSql, params);
  } catch (error) {
    if (!isMissingQuestionSharingColumnError(error)) {
      throw error;
    }

    const legacyRows = await all<
      Omit<
        QuestionRow,
        "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"
      >
    >(db, legacySql, params);

    return legacyRows.map((row) => toCompatQuestionRow(row));
  }
};

const normalizeExamRules = (rules: CreateExamArgs["rules"]) =>
  (rules ?? []).map((rule) => ({
    label: rule.label,
    bankIds: rule.bankIds ?? [],
    repository: rule.repository ?? "ALL",
    subject: rule.subject?.trim() || null,
    grade: rule.grade ?? null,
    topic: rule.topic?.trim() || null,
    subtopics: (rule.subtopics ?? []).map((value) => value.trim()).filter(Boolean),
    difficulty: rule.difficulty ?? null,
    count: rule.count,
    points: rule.points,
  }));

type AccessibleRuleBank = {
  bank: QuestionBankRow;
  communityAccessible: boolean;
};

const listAccessibleRuleBanksForTeacher = async (
  db: D1DatabaseLike,
  actorId: string,
): Promise<AccessibleRuleBank[]> => {
  const rows = await all<
    QuestionBankRow & {
      community_access: number | null;
    }
  >(
    db,
    `SELECT
      qb.id,
      qb.title,
      qb.description,
      qb.grade,
      qb.subject,
      qb.topic,
      qb.visibility,
      qb.owner_id,
      qb.created_at,
      MAX(
        CASE
          WHEN c.visibility = 'PUBLIC' OR c.owner_id = ? OR cm.id IS NOT NULL
          THEN 1
          ELSE 0
        END
      ) AS community_access
     FROM question_banks qb
     LEFT JOIN community_shared_banks csb
       ON csb.bank_id = qb.id AND csb.status != 'ARCHIVED'
     LEFT JOIN communities c
       ON c.id = csb.community_id
     LEFT JOIN community_members cm
       ON cm.community_id = c.id AND cm.user_id = ?
     WHERE qb.visibility = 'PUBLIC'
        OR qb.owner_id = ?
        OR c.visibility = 'PUBLIC'
        OR c.owner_id = ?
        OR cm.id IS NOT NULL
     GROUP BY
      qb.id,
      qb.title,
      qb.description,
      qb.grade,
      qb.subject,
      qb.topic,
      qb.visibility,
      qb.owner_id,
      qb.created_at
     ORDER BY qb.created_at DESC`,
    [actorId, actorId, actorId, actorId],
  );

  return rows.map(({ community_access, ...bank }) => ({
    bank,
    communityAccessible: (community_access ?? 0) === 1,
  }));
};

const getRuleRepositoryKind = (bank: QuestionBankRow, communityAccessible: boolean) =>
  bank.visibility === "PUBLIC" || communityAccessible ? "UNIFIED" : "MINE";

const matchesRuleRepository = (
  repository: QuestionRepositoryFilter | null | undefined,
  bank: QuestionBankRow,
  communityAccessible: boolean,
) =>
  !repository ||
  repository === "ALL" ||
  repository === getRuleRepositoryKind(bank, communityAccessible);

const matchesRuleSubtopics = (
  row: QuestionRow,
  bank: QuestionBankRow,
  subtopics: string[],
) => {
  if (subtopics.length === 0) {
    return true;
  }

  const tagSet = new Set(parseJsonArray(row.tags_json));
  return subtopics.some((subtopic) => tagSet.has(subtopic) || bank.topic === subtopic);
};

const normalizeDiagnosticConfig = (
  config: CreateExamArgs["diagnosticConfig"] | undefined,
): ExamDiagnosticConfig | null => {
  if (!config) {
    return null;
  }

  return {
    enabled: config.enabled ?? false,
    questionLimit: Math.max(1, config.questionLimit ?? 10),
    startDifficulty: config.startDifficulty ?? "MEDIUM",
    retakeMode: config.retakeMode ?? "RANDOM_VARIANT",
  };
};

const serializeExamConfiguration = ({
  rules,
  diagnosticConfig,
}: {
  rules: ReturnType<typeof normalizeExamRules>;
  diagnosticConfig: ExamDiagnosticConfig | null;
}) =>
  JSON.stringify({
    rules,
    diagnosticConfig,
  });

const validateDiagnosticConfig = ({
  diagnosticConfig,
  mode,
}: {
  diagnosticConfig: ExamDiagnosticConfig | null;
  mode: ExamMode;
}) => {
  if (!diagnosticConfig || !diagnosticConfig.enabled) {
    return;
  }

  invariant(mode === "PRACTICE", "Diagnostic тохиргоо зөвхөн free test дээр ажиллана.");
  invariant(
    diagnosticConfig.questionLimit >= 5 && diagnosticConfig.questionLimit <= 60,
    "Diagnostic асуултын тоо 5-60 хооронд байна.",
  );
};

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

const countExamAttempts = async (db: D1DatabaseLike, examId: string) => {
  const row = await first<{ count: number }>(
    db,
    "SELECT COUNT(*) AS count FROM attempts WHERE exam_id = ?",
    [examId],
  );

  return row?.count ?? 0;
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

    const sourceBanks =
      rule.bankIds.length > 0
        ? await Promise.all(
            rule.bankIds.map(async (bankId) => ({
              bank: await findQuestionBankById(db, bankId),
              communityAccessible: false,
            })),
          )
        : actor.role === "TEACHER"
          ? (await listAccessibleRuleBanksForTeacher(db, actor.id)).filter(
              ({ bank, communityAccessible }) =>
                matchesRuleRepository(rule.repository, bank, communityAccessible) &&
                (!rule.subject || bank.subject === rule.subject) &&
                (rule.grade === null || bank.grade === rule.grade) &&
                (!rule.topic || bank.topic === rule.topic),
            )
          : (
              await all<QuestionBankRow>(
                db,
                `SELECT id, title, description, grade, subject, topic, visibility, owner_id, created_at
                 FROM question_banks
                 ORDER BY created_at DESC`,
              )
            )
              .map((bank) => ({ bank, communityAccessible: false }))
              .filter(
                ({ bank, communityAccessible }) =>
                  matchesRuleRepository(rule.repository, bank, communityAccessible) &&
                  (!rule.subject || bank.subject === rule.subject) &&
                  (rule.grade === null || bank.grade === rule.grade) &&
                  (!rule.topic || bank.topic === rule.topic),
              );

    invariant(sourceBanks.length > 0, "Rule-д тохирох сан олдсонгүй.");

    const ownedBankIds = new Set<string>();
    const sourceBankIds: string[] = [];

    for (const { bank, communityAccessible } of sourceBanks) {
      sourceBankIds.push(bank.id);
      if (actor.role === "TEACHER") {
        invariant(
          bank.owner_id === actor.id || bank.visibility === "PUBLIC" || communityAccessible,
          "Rule-д ашиглах сангуудын эрх хүрэхгүй байна.",
        );
        if (bank.owner_id === actor.id) {
          ownedBankIds.add(bank.id);
        }
      }
    }

    const placeholders = sourceBankIds.map(() => "?").join(", ");
    const rows = (
      await allQuestionsCompat(
        db,
        `SELECT
          ${fullQuestionSelectFields}
         FROM questions
         WHERE bank_id IN (${placeholders})
         ORDER BY created_at DESC`,
        `SELECT
          ${legacyQuestionSelectFields}
         FROM questions
         WHERE bank_id IN (${placeholders})
         ORDER BY created_at DESC`,
        sourceBankIds,
      )
    ).filter(
      (row) =>
        (mode !== "PRACTICE" || !["ESSAY", "IMAGE_UPLOAD"].includes(row.type)) &&
        (rule.difficulty === null || row.difficulty === rule.difficulty),
    );

    const accessRequiredQuestionIds =
      actor.role === "TEACHER"
        ? rows
            .filter(
              (row) =>
                row.requires_access_request === 1 &&
                !ownedBankIds.has(row.bank_id),
            )
            .map((row) => row.id)
        : [];
    const approvedQuestionIds = new Set<string>();

    if (accessRequiredQuestionIds.length > 0) {
      const approvedPlaceholders = accessRequiredQuestionIds.map(() => "?").join(", ");
      try {
        const approvedRows = await all<{ question_id: string }>(
          db,
          `SELECT question_id
           FROM question_access_requests
           WHERE requester_user_id = ?
             AND status = 'APPROVED'
             AND question_id IN (${approvedPlaceholders})`,
          [actor.id, ...accessRequiredQuestionIds],
        );

        for (const approvedRow of approvedRows) {
          approvedQuestionIds.add(approvedRow.question_id);
        }
      } catch (error) {
        if (!isMissingQuestionAccessRequestsTableError(error)) {
          throw error;
        }
      }
    }

    const bankById = new Map(sourceBanks.map((entry) => [entry.bank.id, entry.bank] as const));

    const availableRows = rows.filter((row) => {
      const bank = bankById.get(row.bank_id);
      if (!bank) {
        return false;
      }

      return (
        !usedQuestionIds.has(row.id) &&
        matchesRuleSubtopics(row, bank, rule.subtopics ?? []) &&
        (actor.role !== "TEACHER" ||
          row.requires_access_request !== 1 ||
          ownedBankIds.has(row.bank_id) ||
          approvedQuestionIds.has(row.id))
      );
    });
    invariant(
      availableRows.length >= rule.count,
      `${rule.label} сэдвээс ${rule.count} асуулт бүрдүүлэхэд хүрэлцэхгүй байна.`,
    );

    const picked = stableShuffle(
      availableRows,
      `${examId}:${sourceBankIds.join("|")}:${rule.topic ?? "ALL"}:${(rule.subtopics ?? []).join("|")}:${rule.difficulty ?? "ALL"}:${index}`,
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

const parseTimestamp = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const resolveDraftTiming = ({
  currentScheduledFor = null,
  currentStartedAt = null,
  durationMinutes,
  mode,
  scheduledFor,
}: {
  currentScheduledFor?: string | null;
  currentStartedAt?: string | null;
  durationMinutes: number;
  mode: ExamMode;
  scheduledFor?: string | null;
}) => {
  if (mode === "PRACTICE") {
    return {
      endsAt: null,
      scheduledFor: scheduledFor ?? currentScheduledFor,
      startedAt: null,
    };
  }

  if (scheduledFor) {
    invariant(
      parseTimestamp(scheduledFor) !== null,
      "Товлосон огноо, цаг буруу байна.",
    );

    return {
      endsAt: getExamEndTimestamp(scheduledFor, durationMinutes),
      scheduledFor,
      startedAt: scheduledFor,
    };
  }

  const fallbackStart = currentStartedAt ?? currentScheduledFor;
  if (!fallbackStart) {
    return {
      endsAt: null,
      scheduledFor: currentScheduledFor,
      startedAt: null,
    };
  }

  invariant(
    parseTimestamp(fallbackStart) !== null,
    "Товлосон огноо, цаг буруу байна.",
  );

  return {
    endsAt: getExamEndTimestamp(fallbackStart, durationMinutes),
    scheduledFor: currentScheduledFor ?? fallbackStart,
    startedAt: fallbackStart,
  };
};

const canReuseAsAssignmentSource = (exam: ExamRow) =>
  exam.is_template === 1 || (!exam.source_exam_id && exam.status === "DRAFT");

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
      diagnosticConfig,
      passingCriteriaType,
      passingThreshold,
    }: CreateExamArgs,
    context: RequestContext,
  ) => {
    const classroom = await findClass(db, classId);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    invariant(durationMinutes > 0, "Шалгалтын хугацаа 0-ээс их байна.");
    if (actor.role === "TEACHER") {
      invariant(
        classroom.teacher_id === actor.id,
        "You can only create exams for your own classes.",
      );
    }
    const id = makeId("exam");
    const createdAt = now();
    const normalizedRules = normalizeExamRules(rules);
    const normalizedDiagnosticConfig = normalizeDiagnosticConfig(diagnosticConfig);

    if ((generationMode ?? "MANUAL") === "RULE_BASED") {
      invariant(normalizedRules.length > 0, "Rule-based шалгалтад дор хаяж нэг rule хэрэгтэй.");
    }
    const resolvedMode = mode ?? "SCHEDULED";
    validateDiagnosticConfig({
      diagnosticConfig: normalizedDiagnosticConfig,
      mode: resolvedMode,
    });
    const timing = resolveDraftTiming({
      durationMinutes,
      mode: resolvedMode,
      scheduledFor,
    });
    const isTemplate = resolvedMode === "PRACTICE" ? 1 : 0;

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
        isTemplate,
        null,
        title,
        description ?? null,
        resolvedMode,
        "DRAFT",
        durationMinutes,
        timing.startedAt,
        timing.endsAt,
        actor.id,
        timing.scheduledFor ?? createdAt,
        shuffleQuestions ? 1 : 0,
        shuffleAnswers ? 1 : 0,
        generationMode ?? "MANUAL",
        serializeExamConfiguration({
          rules: normalizedRules,
          diagnosticConfig: normalizedDiagnosticConfig,
        }),
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
    invariant(
      canReuseAsAssignmentSource(sourceExam),
      "Зөвхөн reusable ноорог шалгалтыг ангид оноож болно.",
    );
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
          sourceExam.started_at,
          sourceExam.ends_at,
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
    const question = await findQuestion(db, questionId);
    if (actor.role === "TEACHER") {
      const questionBank = await findQuestionBankById(db, question.bank_id);
      invariant(
        await canActorUseQuestion({ actor, bank: questionBank, db, question }),
        "Энэ асуултыг шалгалтдаа ашиглах эрх алга.",
      );
    }

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
      diagnosticConfig,
      passingCriteriaType,
      passingThreshold,
      questionItems,
    }: UpdateExamDraftArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    invariant(exam.status === "DRAFT", "Зөвхөн draft шалгалтыг засварлаж болно.");
    invariant(durationMinutes > 0, "Шалгалтын хугацаа 0-ээс их байна.");

    const currentClass = await findClass(db, exam.class_id);
    const nextClass = await findClass(db, classId);
    if (actor.role === "TEACHER") {
      invariant(
        currentClass.teacher_id === actor.id && nextClass.teacher_id === actor.id,
        "You can only edit draft exams for your own classes.",
      );
    }

    const normalizedRules = normalizeExamRules(rules);
    const normalizedDiagnosticConfig = normalizeDiagnosticConfig(diagnosticConfig);
    if ((generationMode ?? "MANUAL") === "RULE_BASED") {
      invariant(normalizedRules.length > 0, "Rule-based шалгалтад дор хаяж нэг rule хэрэгтэй.");
    } else {
      invariant((questionItems?.length ?? 0) > 0, "Гараар сонгосон дор хаяж нэг асуулт байна.");
      const seenQuestionIds = new Set<string>();
      for (const item of questionItems ?? []) {
        invariant(item.points > 0, "Асуултын оноо 1-ээс их байна.");
        invariant(!seenQuestionIds.has(item.questionId), "Давхардсан асуулт илэрлээ.");
        seenQuestionIds.add(item.questionId);
        const question = await findQuestion(db, item.questionId);
        if (actor.role === "TEACHER") {
          const questionBank = await findQuestionBankById(db, question.bank_id);
          invariant(
            await canActorUseQuestion({ actor, bank: questionBank, db, question }),
            "Зарим асуултыг энэ шалгалтад ашиглах эрх алга.",
          );
        }
      }
    }
    const resolvedMode = mode ?? exam.mode;
    validateDiagnosticConfig({
      diagnosticConfig: normalizedDiagnosticConfig,
      mode: resolvedMode,
    });
    const timing = resolveDraftTiming({
      currentScheduledFor: exam.scheduled_for,
      currentStartedAt: exam.started_at,
      durationMinutes,
      mode: resolvedMode,
      scheduledFor,
    });

    await run(
      db,
      `UPDATE exams
       SET class_id = ?,
           title = ?,
           description = ?,
           mode = ?,
           duration_minutes = ?,
           started_at = ?,
           ends_at = ?,
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
        resolvedMode,
        durationMinutes,
        timing.startedAt,
        timing.endsAt,
        timing.scheduledFor ?? exam.scheduled_for ?? now(),
        shuffleQuestions ? 1 : 0,
        shuffleAnswers ? 1 : 0,
        generationMode ?? "MANUAL",
        serializeExamConfiguration({
          rules: normalizedRules,
          diagnosticConfig: normalizedDiagnosticConfig,
        }),
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
  deleteExam: async ({ examId }: DeleteExamArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    invariant(!exam.is_template, "Template шалгалтыг эндээс устгах боломжгүй.");
    invariant(exam.status === "DRAFT", "Зөвхөн эхлээгүй draft шалгалтыг устгана.");

    if (actor.role === "TEACHER") {
      const classroom = await findClass(db, exam.class_id);
      invariant(
        classroom.teacher_id === actor.id,
        "You can only delete exams for your own classes.",
      );
    }

    invariant(
      (await countExamAttempts(db, examId)) === 0,
      "Хүүхэд оролдсон шалгалтыг устгах боломжгүй.",
    );

    await run(db, "DELETE FROM exam_questions WHERE exam_id = ?", [examId]);
    await run(db, "DELETE FROM exams WHERE id = ?", [examId]);

    return true;
  },
  publishExam: async ({ examId }: PublishExamArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const exam = await findExamById(db, examId);
    if (actor.role === "TEACHER") {
      const classroom = await findClass(db, exam.class_id);
      invariant(
        classroom.teacher_id === actor.id,
        "You can only publish exams for your own classes.",
      );
    }
    invariant(exam.status === "DRAFT", "Only draft exams can be started.");
    const startedAt =
      exam.mode === "PRACTICE"
        ? now()
        : exam.started_at ?? now();
    const endsAt = exam.mode === "PRACTICE"
      ? null
      : exam.ends_at ?? getExamEndTimestamp(startedAt, exam.duration_minutes);
    await run(
      db,
      "UPDATE exams SET is_template = 0, status = 'PUBLISHED', started_at = ?, ends_at = ? WHERE id = ?",
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
