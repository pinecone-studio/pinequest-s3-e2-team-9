import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import type { QuestionBankMutationEvent } from "../../live-exam-events";
import {
  type ForkQuestionToMyBankArgs,
  type CreateExamDraftVariantsArgs,
  type CreateQuestionVariantsArgs,
  type DeleteQuestionArgs,
  type GroupQuestionsAsVariantsArgs,
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type ByIdArgs,
  type CreateQuestionArgs,
  type CreateQuestionBankArgs,
  type QuestionAccessRequestRow,
  type QuestionBankRow,
  type QuestionRow,
  type QuestionsArgs,
  type RequestQuestionAccessArgs,
  type ReviewQuestionAccessRequestArgs,
  type Role,
  type UpdateQuestionArgs,
  type UserRow,
} from "../types";

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

const isMissingQuestionSharingColumnError = (error: unknown) =>
  error instanceof Error &&
  /no such column: (?:[a-z_]+\.)?(canonical_question_id|forked_from_question_id|share_scope|requires_access_request)/i.test(
    error.message,
  );

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

const firstQuestionCompat = async (
  db: D1DatabaseLike,
  fullSql: string,
  legacySql: string,
  params: unknown[],
) => {
  try {
    return await first<QuestionRow>(db, fullSql, params);
  } catch (error) {
    if (!isMissingQuestionSharingColumnError(error)) {
      throw error;
    }

    const legacyRow = await first<
      Omit<
        QuestionRow,
        "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"
      >
    >(db, legacySql, params);

    return legacyRow ? toCompatQuestionRow(legacyRow) : null;
  }
};

export const findQuestionBankById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionBankRow> => {
  const bank = await first<QuestionBankRow>(
    db,
    "SELECT id, title, description, grade, subject, topic, visibility, owner_id, created_at FROM question_banks WHERE id = ?",
    [id],
  );
  invariant(bank, `Question bank ${id} not found`);
  return bank;
};

export const findQuestionById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionRow> => {
  const question = await firstQuestionCompat(
    db,
    `SELECT ${fullQuestionSelectFields}
     FROM questions
     WHERE id = ?`,
    `SELECT ${legacyQuestionSelectFields}
     FROM questions
     WHERE id = ?`,
    [id],
  );
  invariant(question, `Question ${id} not found`);
  return question;
};

const normalizeQuestionOptions = (
  type: QuestionRow["type"],
  options?: string[],
) =>
  type === "TRUE_FALSE" ? ["True", "False"] : type === "MCQ" ? options ?? [] : [];

const VARIANT_LABELS = ["A", "B", "C", "D"];
const VARIANT_GROUP_TAG = "variant_group:";
const VARIANT_LABEL_TAG = "variant_label:";
const VARIANT_COUNT_TAG = "variant_count:";
const DRAFT_VARIANT_TAG = "variant_draft:true";

const stripVariantTags = (tags: string[]) =>
  tags.filter(
    (tag) =>
      !tag.startsWith(VARIANT_GROUP_TAG) &&
      !tag.startsWith(VARIANT_LABEL_TAG) &&
      !tag.startsWith(VARIANT_COUNT_TAG),
  );

const toVariantTags = (tags: string[], groupId: string, label: string, totalVariants: number) => [
  ...stripVariantTags(tags),
  `${VARIANT_GROUP_TAG}${groupId}`,
  `${VARIANT_LABEL_TAG}${label}`,
  `${VARIANT_COUNT_TAG}${totalVariants}`,
];

const toDraftVariantTags = (
  tags: string[],
  groupId: string,
  label: string,
  totalVariants: number,
) => [...toVariantTags(tags, groupId, label, totalVariants), DRAFT_VARIANT_TAG];

const toVariantTitle = (value: string, label: string) =>
  `${value.replace(/\s+\([A-D]\)$/u, "").trim()} (${label})`;

const transformNumericText = (value: string, offsetSeed: number) =>
  value.replace(/-?\d+(\.\d+)?/g, (match, _decimal, index) => {
    const parsed = Number(match);
    if (!Number.isFinite(parsed)) {
      return match;
    }
    const offset = offsetSeed + (typeof index === "number" ? index % 3 : 0);
    const nextValue = parsed + offset;
    return Number.isInteger(parsed) ? String(nextValue) : nextValue.toFixed(1);
  });

const buildVariantDraft = (
  question: QuestionRow,
  label: string,
  offsetSeed: number,
): {
  title: string;
  prompt: string;
  options: string[];
  correctAnswer: string | null;
} => {
  const originalOptions = parseJsonArray(question.options_json);
  const titleBase = question.title.trim() || question.prompt.trim();
  const nextPrompt = transformNumericText(question.prompt, offsetSeed);
  const nextOptions = originalOptions.map((option, optionIndex) =>
    transformNumericText(option, offsetSeed + optionIndex + 1),
  );
  const correctIndex = originalOptions.findIndex(
    (option) => option === (question.correct_answer ?? ""),
  );

  return {
    title: toVariantTitle(titleBase, label),
    prompt:
      nextPrompt && nextPrompt !== question.prompt
        ? nextPrompt
        : `${question.prompt} (${label})`,
    options: normalizeQuestionOptions(question.type, nextOptions),
    correctAnswer:
      correctIndex >= 0 && nextOptions[correctIndex]
        ? nextOptions[correctIndex]
        : question.correct_answer,
  };
};

const normalizeVariantSelection = (
  questions: QuestionRow[],
): Array<{
  question: QuestionRow;
  tags: string[];
}> => {
  invariant(
    questions.length === 2 || questions.length === 4,
    "Хувилбарын бүлэгт 2 эсвэл 4 асуулт сонгоно.",
  );

  const [firstQuestion] = questions;
  invariant(Boolean(firstQuestion), "Дор хаяж нэг асуулт сонгоно.");

  const uniqueQuestionIds = new Set(questions.map((question) => question.id));
  invariant(
    uniqueQuestionIds.size === questions.length,
    "Нэг асуултыг давхар сонгох боломжгүй.",
  );

  return questions.map((question) => {
    invariant(
      question.bank_id === firstQuestion.bank_id,
      "Хувилбарын бүлгийн асуултууд нэг сангаас байна.",
    );
    invariant(
      question.type === firstQuestion.type,
      "Хувилбарын бүлгийн бүх асуулт ижил төрөлтэй байна.",
    );

    return {
      question,
      tags: parseJsonArray(question.tags_json),
    };
  });
};

const questionBankSelectFields =
  "id, title, description, grade, subject, topic, visibility, owner_id, created_at";

const questionAccessRequestSelectFields = `id,
  question_id,
  requester_user_id,
  owner_user_id,
  status,
  created_at,
  reviewed_at`;

const isMissingQuestionAccessRequestsTableError = (error: unknown) =>
  error instanceof Error &&
  /no such table:\s*question_access_requests/i.test(error.message);

const findQuestionAccessRequestById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionAccessRequestRow> => {
  const request = await first<QuestionAccessRequestRow>(
    db,
    `SELECT ${questionAccessRequestSelectFields}
     FROM question_access_requests
     WHERE id = ?`,
    [id],
  );
  invariant(request, `Question access request ${id} not found`);
  return request;
};

const actorHasApprovedQuestionAccess = async (
  db: D1DatabaseLike,
  questionId: string,
  actorId: string,
) => {
  try {
    const row = await first<{ id: string }>(
      db,
      `SELECT id
       FROM question_access_requests
       WHERE question_id = ?
         AND requester_user_id = ?
         AND status = 'APPROVED'
       ORDER BY reviewed_at DESC, created_at DESC
       LIMIT 1`,
      [questionId, actorId],
    );
    return Boolean(row);
  } catch (error) {
    if (isMissingQuestionAccessRequestsTableError(error)) {
      return false;
    }
    throw error;
  }
};

const actorCanUseQuestion = async ({
  actor,
  bank,
  db,
  question,
}: {
  actor: UserRow;
  bank: QuestionBankRow;
  db: D1DatabaseLike;
  question: QuestionRow;
}) => {
  if (actor.role === "ADMIN") {
    return true;
  }

  if (bank.owner_id === actor.id || question.created_by_id === actor.id) {
    return true;
  }

  if (question.requires_access_request === 1) {
    return actorHasApprovedQuestionAccess(db, question.id, actor.id);
  }

  if (question.share_scope === "PUBLIC" || bank.visibility === "PUBLIC") {
    return true;
  }

  if (question.share_scope === "COMMUNITY") {
    const membership = await first<{ id: string }>(
      db,
      `SELECT cm.id
       FROM community_shared_banks csb
       JOIN community_members cm ON cm.community_id = csb.community_id
       WHERE csb.bank_id = ?
         AND cm.user_id = ?
       LIMIT 1`,
      [bank.id, actor.id],
    );

    if (membership) {
      return true;
    }
  }

  return actorHasApprovedQuestionAccess(db, question.id, actor.id);
};

export const canActorUseQuestion = actorCanUseQuestion;

type QuestionModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  publishQuestionBankEvent?: (event: QuestionBankMutationEvent) => Promise<void>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toQuestion: (db: D1DatabaseLike, question: QuestionRow) => unknown;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toUser: (user: UserRow) => unknown;
};

export const createQuestionQueriesAndMutations = ({
  db,
  requireActor,
  publishQuestionBankEvent,
  toQuestionBank,
  toQuestion,
  findUser,
  toUser,
}: QuestionModuleDependencies) => ({
  questionBanks: async (_args: unknown, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const rows =
      actor.role === "ADMIN"
        ? await all<QuestionBankRow>(
            db,
            `SELECT ${questionBankSelectFields}
             FROM question_banks
             ORDER BY created_at DESC`,
          )
        : await all<QuestionBankRow>(
            db,
            `SELECT ${questionBankSelectFields}
             FROM question_banks
             WHERE visibility = 'PUBLIC' OR owner_id = ?
             ORDER BY created_at DESC`,
            [actor.id],
          );
    return rows.map((row) => toQuestionBank(db, row));
  },
  questionBank: async ({ id }: ByIdArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const bank =
      actor.role === "ADMIN"
        ? await first<QuestionBankRow>(
            db,
            `SELECT ${questionBankSelectFields}
             FROM question_banks
             WHERE id = ?`,
            [id],
          )
        : await first<QuestionBankRow>(
            db,
            `SELECT ${questionBankSelectFields}
             FROM question_banks
             WHERE id = ? AND (visibility = 'PUBLIC' OR owner_id = ?)`,
            [id, actor.id],
          );
    return bank ? toQuestionBank(db, bank) : null;
  },
  questions: async ({ bankId }: QuestionsArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const rows =
      actor.role === "ADMIN"
        ? bankId
          ? await allQuestionsCompat(
              db,
              `SELECT ${fullQuestionSelectFields}
               FROM questions
               WHERE bank_id = ?
               ORDER BY created_at DESC`,
              `SELECT ${legacyQuestionSelectFields}
               FROM questions
               WHERE bank_id = ?
               ORDER BY created_at DESC`,
              [bankId],
            )
          : await allQuestionsCompat(
              db,
              `SELECT ${fullQuestionSelectFields}
               FROM questions
               ORDER BY created_at DESC`,
              `SELECT ${legacyQuestionSelectFields}
               FROM questions
               ORDER BY created_at DESC`,
              [],
            )
        : bankId
          ? await allQuestionsCompat(
              db,
              `SELECT q.${fullQuestionSelectFields.replaceAll(",\n  ", ",\n                q.")}
               FROM questions q
               JOIN question_banks qb ON qb.id = q.bank_id
               WHERE q.bank_id = ? AND (qb.visibility = 'PUBLIC' OR qb.owner_id = ?)
               ORDER BY q.created_at DESC`,
              `SELECT q.${legacyQuestionSelectFields.replaceAll(",\n  ", ",\n                q.")}
               FROM questions q
               JOIN question_banks qb ON qb.id = q.bank_id
               WHERE q.bank_id = ? AND (qb.visibility = 'PUBLIC' OR qb.owner_id = ?)
               ORDER BY q.created_at DESC`,
              [bankId, actor.id],
            )
          : await allQuestionsCompat(
              db,
              `SELECT q.${fullQuestionSelectFields.replaceAll(",\n  ", ",\n                q.")}
               FROM questions q
               JOIN question_banks qb ON qb.id = q.bank_id
               WHERE qb.visibility = 'PUBLIC' OR qb.owner_id = ?
               ORDER BY q.created_at DESC`,
              `SELECT q.${legacyQuestionSelectFields.replaceAll(",\n  ", ",\n                q.")}
               FROM questions q
               JOIN question_banks qb ON qb.id = q.bank_id
               WHERE qb.visibility = 'PUBLIC' OR qb.owner_id = ?
               ORDER BY q.created_at DESC`,
              [actor.id],
            );
    return rows.map((row) => toQuestion(db, row));
  },
  questionAccessRequests: async (_args: unknown, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    let rows: QuestionAccessRequestRow[] = [];
    try {
      rows =
        actor.role === "ADMIN"
          ? await all<QuestionAccessRequestRow>(
              db,
              `SELECT ${questionAccessRequestSelectFields}
               FROM question_access_requests
               ORDER BY created_at DESC`,
            )
          : await all<QuestionAccessRequestRow>(
              db,
              `SELECT ${questionAccessRequestSelectFields}
               FROM question_access_requests
               WHERE requester_user_id = ? OR owner_user_id = ?
               ORDER BY created_at DESC`,
              [actor.id, actor.id],
            );
    } catch (error) {
      if (!isMissingQuestionAccessRequestsTableError(error)) {
        throw error;
      }
      rows = [];
    }

    return Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        question: async () => toQuestion(db, await findQuestionById(db, row.question_id)),
        requester: async () => toUser(await findUser(db, row.requester_user_id)),
        owner: async () => toUser(await findUser(db, row.owner_user_id)),
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
      })),
    );
  },
  createQuestionBank: async (
    { title, description, grade, subject, topic, visibility }: CreateQuestionBankArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const id = makeId("bank");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description ?? null,
        grade ?? 10,
        subject?.trim() || "Ерөнхий",
        topic?.trim() || "Ерөнхий",
        visibility ?? "PRIVATE",
        actor.id,
        createdAt,
      ],
    );

    const createdBank = await findQuestionBankById(db, id);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: createdBank.id,
      change: "CREATED",
      emittedAt: now(),
      ownerId: createdBank.owner_id,
      questionId: null,
      visibility: createdBank.visibility,
    });

    return toQuestionBank(db, createdBank);
  },
  createQuestion: async (
    {
      bankId,
      type,
      title,
      prompt,
      options,
      correctAnswer,
      difficulty,
      shareScope,
      requiresAccessRequest,
      tags,
    }: CreateQuestionArgs,
    context: RequestContext,
  ) => {
    const bank = await findQuestionBankById(db, bankId);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    if (actor.role === "TEACHER") {
      invariant(bank.owner_id === actor.id, "You can only create questions in your own question banks.");
    }
    const id = makeId("question");
    const createdAt = now();
    const normalizedOptions = normalizeQuestionOptions(type, options);

    await run(
      db,
      `INSERT INTO questions (
        id,
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
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bankId,
        id,
        null,
        type,
        title,
        prompt,
        toJsonArray(normalizedOptions),
        correctAnswer ?? null,
        difficulty ?? "MEDIUM",
        shareScope ?? (bank.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE"),
        requiresAccessRequest ? 1 : 0,
        toJsonArray(tags),
        actor.id,
        createdAt,
      ],
    );

    const createdQuestion = await findQuestionById(db, id);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "CREATED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: createdQuestion.id,
      visibility: bank.visibility,
    });

    return toQuestion(db, createdQuestion);
  },
  createQuestionVariants: async (
    { sourceQuestionId, totalVariants }: CreateQuestionVariantsArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    invariant(
      Number.isInteger(totalVariants) && totalVariants >= 2 && totalVariants <= 4,
      "Variant тоо 2-4 хооронд байна.",
    );

    const question = await findQuestionById(db, sourceQuestionId);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(
        bank.owner_id === actor.id,
        "You can only generate variants from your own question banks.",
      );
    }

    invariant(
      question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD",
      "Энэ төрлийн асуултад draft variant автоматаар үүсгэх боломжгүй.",
    );

    const existingTags = parseJsonArray(question.tags_json);
    const groupId =
      existingTags.find((tag) => tag.startsWith(VARIANT_GROUP_TAG))?.replace(VARIANT_GROUP_TAG, "") ??
      makeId("variant_group");

    await run(
      db,
      `UPDATE questions
       SET title = ?, prompt = ?, tags_json = ?
       WHERE id = ?`,
      [
        toVariantTitle(question.title.trim() || question.prompt.trim(), "A"),
        question.prompt,
        toJsonArray(toVariantTags(existingTags, groupId, "A", totalVariants)),
        sourceQuestionId,
      ],
    );

    const createdIds = [sourceQuestionId];

    for (let index = 1; index < totalVariants; index += 1) {
      const label = VARIANT_LABELS[index] ?? `V${index + 1}`;
      const nextId = makeId("question");
      const draft = buildVariantDraft(question, label, index * 2);
      await run(
        db,
        `INSERT INTO questions (
          id,
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
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          question.bank_id,
          question.canonical_question_id ?? question.id,
          question.id,
          question.type,
          draft.title,
          draft.prompt,
          toJsonArray(draft.options),
          draft.correctAnswer ?? null,
          question.difficulty,
          question.share_scope,
          question.requires_access_request,
          toJsonArray(toVariantTags(existingTags, groupId, label, totalVariants)),
          actor.id,
          now(),
        ],
      );
      createdIds.push(nextId);
    }

    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "VARIANTS_CREATED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: sourceQuestionId,
      visibility: bank.visibility,
    });

    return Promise.all(createdIds.map(async (id) => toQuestion(db, await findQuestionById(db, id))));
  },
  createExamDraftVariants: async (
    { sourceQuestionId, totalVariants }: CreateExamDraftVariantsArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    invariant(
      Number.isInteger(totalVariants) && totalVariants >= 2 && totalVariants <= 4,
      "Variant тоо 2-4 хооронд байна.",
    );

    const question = await findQuestionById(db, sourceQuestionId);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(
        await actorCanUseQuestion({ actor, bank, db, question }),
        "Энэ асуултаас draft variant үүсгэх эрх алга.",
      );
    }

    invariant(
      question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD",
      "Энэ төрлийн асуултад draft variant автоматаар үүсгэх боломжгүй.",
    );

    const existingTags = parseJsonArray(question.tags_json);
    const groupId = makeId("variant_group");
    const createdIds: string[] = [];

    for (let index = 0; index < totalVariants; index += 1) {
      const label = VARIANT_LABELS[index] ?? `V${index + 1}`;
      const nextId = makeId("question");
      const draft =
        index === 0
          ? {
              title: toVariantTitle(question.title.trim() || question.prompt.trim(), label),
              prompt: question.prompt,
              options: parseJsonArray(question.options_json),
              correctAnswer: question.correct_answer,
            }
          : buildVariantDraft(question, label, index * 2);

      await run(
        db,
        `INSERT INTO questions (
          id,
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
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          question.bank_id,
          question.canonical_question_id ?? question.id,
          question.id,
          question.type,
          draft.title,
          draft.prompt,
          toJsonArray(normalizeQuestionOptions(question.type, draft.options)),
          draft.correctAnswer ?? null,
          question.difficulty,
          question.share_scope,
          question.requires_access_request,
          toJsonArray(toDraftVariantTags(existingTags, groupId, label, totalVariants)),
          actor.id,
          now(),
        ],
      );
      createdIds.push(nextId);
    }

    return Promise.all(
      createdIds.map(async (id) => toQuestion(db, await findQuestionById(db, id))),
    );
  },
  groupQuestionsAsVariants: async (
    { questionIds }: GroupQuestionsAsVariantsArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const selectedQuestions = await Promise.all(
      questionIds.map(async (id) => findQuestionById(db, id)),
    );
    const normalizedQuestions = normalizeVariantSelection(selectedQuestions);
    const bank = await findQuestionBankById(db, normalizedQuestions[0].question.bank_id);

    if (actor.role === "TEACHER") {
      for (const { question } of normalizedQuestions) {
        const questionBank = await findQuestionBankById(db, question.bank_id);
        invariant(
          await actorCanUseQuestion({ actor, bank: questionBank, db, question }),
          "Эдгээр асуултыг хувилбарын бүлэг болгох эрх алга.",
        );
      }
    }

    const groupId = makeId("variant_group");
    const totalVariants = normalizedQuestions.length;

    for (const [index, item] of normalizedQuestions.entries()) {
      const label = VARIANT_LABELS[index] ?? `V${index + 1}`;
      await run(
        db,
        `UPDATE questions
         SET tags_json = ?
         WHERE id = ?`,
        [
          toJsonArray(toVariantTags(item.tags, groupId, label, totalVariants)),
          item.question.id,
        ],
      );
    }

    return Promise.all(
      normalizedQuestions.map(async ({ question }) =>
        toQuestion(db, await findQuestionById(db, question.id)),
      ),
    );
  },
  updateQuestion: async (
    {
      id,
      type,
      title,
      prompt,
      options,
      correctAnswer,
      difficulty,
      shareScope,
      requiresAccessRequest,
      tags,
    }: UpdateQuestionArgs,
    context: RequestContext,
  ) => {
    const question = await findQuestionById(db, id);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(bank.owner_id === actor.id, "You can only update questions in your own question banks.");
    }

    await run(
      db,
      `UPDATE questions
       SET type = ?, title = ?, prompt = ?, options_json = ?, correct_answer = ?, difficulty = ?, share_scope = ?, requires_access_request = ?, tags_json = ?
       WHERE id = ?`,
      [
        type,
        title,
        prompt,
        toJsonArray(normalizeQuestionOptions(type, options)),
        correctAnswer ?? null,
        difficulty ?? question.difficulty,
        shareScope ?? question.share_scope,
        typeof requiresAccessRequest === "boolean"
          ? (requiresAccessRequest ? 1 : 0)
          : question.requires_access_request,
        toJsonArray(tags),
        id,
      ],
    );

    const updatedQuestion = await findQuestionById(db, id);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "UPDATED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: updatedQuestion.id,
      visibility: bank.visibility,
    });

    return toQuestion(db, updatedQuestion);
  },
  deleteQuestion: async ({ id }: DeleteQuestionArgs, context: RequestContext) => {
    const question = await findQuestionById(db, id);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(bank.owner_id === actor.id, "You can only delete questions in your own question banks.");
    }
    await run(db, "DELETE FROM questions WHERE id = ?", [id]);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "DELETED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: id,
      visibility: bank.visibility,
    });
    return true;
  },
  requestQuestionAccess: async (
    { questionId }: RequestQuestionAccessArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const question = await findQuestionById(db, questionId);
    const bank = await findQuestionBankById(db, question.bank_id);

    invariant(actor.role !== "ADMIN", "Админд хүсэлт илгээх шаардлагагүй.");
    invariant(bank.owner_id !== actor.id, "Өөрийн асуулт дээр хүсэлт илгээхгүй.");
    invariant(
      question.requires_access_request === 1 ||
        (question.share_scope !== "PUBLIC" && bank.visibility !== "PUBLIC"),
      "Нээлттэй асуултыг хүсэлтгүй ашиглаж болно.",
    );

    let existingPending: QuestionAccessRequestRow | null = null;
    try {
      existingPending = await first<QuestionAccessRequestRow>(
        db,
        `SELECT ${questionAccessRequestSelectFields}
         FROM question_access_requests
         WHERE question_id = ?
           AND requester_user_id = ?
           AND status = 'PENDING'
         LIMIT 1`,
        [questionId, actor.id],
      );
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }

    if (existingPending) {
      return {
        id: existingPending.id,
        question: async () => toQuestion(db, question),
        requester: async () => toUser(actor),
        owner: async () => toUser(await findUser(db, bank.owner_id)),
        status: existingPending.status,
        createdAt: existingPending.created_at,
        reviewedAt: existingPending.reviewed_at,
      };
    }

    const createdAt = now();
    const id = makeId("question_access_request");
    try {
      await run(
        db,
        `INSERT INTO question_access_requests (
          id,
          question_id,
          requester_user_id,
          owner_user_id,
          status,
          created_at,
          reviewed_at
        )
        VALUES (?, ?, ?, ?, 'PENDING', ?, NULL)`,
        [id, questionId, actor.id, bank.owner_id, createdAt],
      );
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }

    return {
      id,
      question: async () => toQuestion(db, question),
      requester: async () => toUser(actor),
      owner: async () => toUser(await findUser(db, bank.owner_id)),
      status: "PENDING",
      createdAt,
      reviewedAt: null,
    };
  },
  reviewQuestionAccessRequest: async (
    { requestId, approve }: ReviewQuestionAccessRequestArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    let request: QuestionAccessRequestRow;
    try {
      request = await findQuestionAccessRequestById(db, requestId);
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }
    invariant(
      actor.role === "ADMIN" || request.owner_user_id === actor.id,
      "Зөвхөн асуултын эзэмшигч хүсэлтийг шийднэ.",
    );
    invariant(request.status === "PENDING", "Зөвхөн pending хүсэлтийг шийднэ.");

    const reviewedAt = now();
    const nextStatus = approve ? "APPROVED" : "REJECTED";
    try {
      await run(
        db,
        `UPDATE question_access_requests
         SET status = ?, reviewed_at = ?
         WHERE id = ?`,
        [nextStatus, reviewedAt, requestId],
      );
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }

    const nextRequest = await findQuestionAccessRequestById(db, requestId);
    return {
      id: nextRequest.id,
      question: async () =>
        toQuestion(db, await findQuestionById(db, nextRequest.question_id)),
      requester: async () => toUser(await findUser(db, nextRequest.requester_user_id)),
      owner: async () => toUser(await findUser(db, nextRequest.owner_user_id)),
      status: nextRequest.status,
      createdAt: nextRequest.created_at,
      reviewedAt: nextRequest.reviewed_at,
    };
  },
  forkQuestionToMyBank: async (
    { questionId, targetBankId }: ForkQuestionToMyBankArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const question = await findQuestionById(db, questionId);
    const sourceBank = await findQuestionBankById(db, question.bank_id);
    const targetBank = await findQuestionBankById(db, targetBankId);

    if (actor.role === "TEACHER") {
      invariant(targetBank.owner_id === actor.id, "Зөвхөн өөрийн сан руу хувилбарлана.");
      invariant(
        await actorCanUseQuestion({ actor, bank: sourceBank, db, question }),
        "Энэ асуултыг хувилбарлаж ашиглах эрх алга.",
      );
    }

    const id = makeId("question");
    const createdAt = now();
    const nextTags = [
      ...parseJsonArray(question.tags_json),
      `forked_from_question:${question.id}`,
      `forked_from_bank:${sourceBank.id}`,
    ];

    await run(
      db,
      `INSERT INTO questions (
        id,
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
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        targetBankId,
        question.canonical_question_id ?? question.id,
        question.id,
        question.type,
        question.title,
        question.prompt,
        question.options_json,
        question.correct_answer,
        question.difficulty,
        "PRIVATE",
        0,
        toJsonArray([...new Set(nextTags)]),
        actor.id,
        createdAt,
      ],
    );

    return toQuestion(db, await findQuestionById(db, id));
  },
});
