import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import {
  type DeleteQuestionArgs,
  makeId,
  now,
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

const questionBankSelectFields =
  "id, title, description, grade, subject, topic, visibility, owner_id, created_at";

type QuestionModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toQuestion: (db: D1DatabaseLike, question: QuestionRow) => unknown;
};

export const createQuestionQueriesAndMutations = ({
  db,
  requireActor,
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

    return toQuestionBank(db, await findQuestionBankById(db, id));
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

    return toQuestion(db, await findQuestionById(db, id));
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
    if (actor.role === "TEACHER") {
      const bank = await findQuestionBankById(db, question.bank_id);
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

    return toQuestion(db, await findQuestionById(db, id));
  },
  deleteQuestion: async ({ id }: DeleteQuestionArgs, context: RequestContext) => {
    const question = await findQuestionById(db, id);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    if (actor.role === "TEACHER") {
      const bank = await findQuestionBankById(db, question.bank_id);
      invariant(bank.owner_id === actor.id, "You can only delete questions in your own question banks.");
    }
    await run(db, "DELETE FROM questions WHERE id = ?", [id]);
    return true;
  },
});
