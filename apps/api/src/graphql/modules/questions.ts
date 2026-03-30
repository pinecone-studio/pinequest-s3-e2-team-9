import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import type { QuestionBankMutationEvent } from "../../live-exam-events";
import {
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
  type QuestionBankRow,
  type QuestionRow,
  type QuestionsArgs,
  type Role,
  type UpdateQuestionArgs,
  type UserRow,
} from "../types";

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
  const question = await first<QuestionRow>(
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

type QuestionModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  publishQuestionBankEvent?: (event: QuestionBankMutationEvent) => Promise<void>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toQuestion: (db: D1DatabaseLike, question: QuestionRow) => unknown;
};

export const createQuestionQueriesAndMutations = ({
  db,
  requireActor,
  publishQuestionBankEvent,
  toQuestionBank,
  toQuestion,
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
          ? await all<QuestionRow>(
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
              WHERE bank_id = ?
              ORDER BY created_at DESC`,
              [bankId],
            )
          : await all<QuestionRow>(
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
              ORDER BY created_at DESC`,
            )
        : bankId
          ? await all<QuestionRow>(
              db,
              `SELECT
                q.id,
                q.bank_id,
                q.type,
                q.title,
                q.prompt,
                q.options_json,
                q.correct_answer,
                q.difficulty,
                q.tags_json,
                q.created_by_id,
                q.created_at
              FROM questions q
              JOIN question_banks qb ON qb.id = q.bank_id
              WHERE q.bank_id = ? AND (qb.visibility = 'PUBLIC' OR qb.owner_id = ?)
              ORDER BY q.created_at DESC`,
              [bankId, actor.id],
            )
          : await all<QuestionRow>(
              db,
              `SELECT
                q.id,
                q.bank_id,
                q.type,
                q.title,
                q.prompt,
                q.options_json,
                q.correct_answer,
                q.difficulty,
                q.tags_json,
                q.created_by_id,
                q.created_at
              FROM questions q
              JOIN question_banks qb ON qb.id = q.bank_id
              WHERE qb.visibility = 'PUBLIC' OR qb.owner_id = ?
              ORDER BY q.created_at DESC`,
              [actor.id],
            );
    return rows.map((row) => toQuestion(db, row));
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
        type,
        title,
        prompt,
        options_json,
        correct_answer,
        difficulty,
        tags_json,
        created_by_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bankId,
        type,
        title,
        prompt,
        toJsonArray(normalizedOptions),
        correctAnswer ?? null,
        difficulty ?? "MEDIUM",
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
          type,
          title,
          prompt,
          options_json,
          correct_answer,
          difficulty,
          tags_json,
          created_by_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          question.bank_id,
          question.type,
          draft.title,
          draft.prompt,
          toJsonArray(draft.options),
          draft.correctAnswer ?? null,
          question.difficulty,
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
        bank.visibility === "PUBLIC" || bank.owner_id === actor.id,
        "Зөвхөн өөрийн эсвэл нээлттэй сангаас draft variant үүсгэнэ.",
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
          type,
          title,
          prompt,
          options_json,
          correct_answer,
          difficulty,
          tags_json,
          created_by_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          question.bank_id,
          question.type,
          draft.title,
          draft.prompt,
          toJsonArray(normalizeQuestionOptions(question.type, draft.options)),
          draft.correctAnswer ?? null,
          question.difficulty,
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
      invariant(
        bank.owner_id === actor.id,
        "You can only group questions from your own question banks.",
      );
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
       SET type = ?, title = ?, prompt = ?, options_json = ?, correct_answer = ?, difficulty = ?, tags_json = ?
       WHERE id = ?`,
      [
        type,
        title,
        prompt,
        toJsonArray(normalizeQuestionOptions(type, options)),
        correctAnswer ?? null,
        difficulty ?? question.difficulty,
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
});
