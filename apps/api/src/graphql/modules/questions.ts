import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
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
    "SELECT id, title, description, subject, owner_id, created_at FROM question_banks WHERE id = ?",
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

type QuestionModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (db: D1DatabaseLike, roles: Role[]) => Promise<UserRow>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toQuestion: (db: D1DatabaseLike, question: QuestionRow) => unknown;
};

export const createQuestionQueriesAndMutations = ({
  db,
  requireActor,
  toQuestionBank,
  toQuestion,
}: QuestionModuleDependencies) => ({
  questionBanks: async () => {
    const rows = await all<QuestionBankRow>(
      db,
      `SELECT id, title, description, subject, owner_id, created_at
       FROM question_banks
       ORDER BY created_at DESC`,
    );
    return rows.map((row) => toQuestionBank(db, row));
  },
  questionBank: async ({ id }: ByIdArgs) => {
    const bank = await first<QuestionBankRow>(
      db,
      `SELECT id, title, description, subject, owner_id, created_at
       FROM question_banks
       WHERE id = ?`,
      [id],
    );
    return bank ? toQuestionBank(db, bank) : null;
  },
  questions: async ({ bankId }: QuestionsArgs) => {
    const rows = bankId
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
        );
    return rows.map((row) => toQuestion(db, row));
  },
  createQuestionBank: async ({ title, description }: CreateQuestionBankArgs) => {
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const id = makeId("bank");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO question_banks (id, title, description, subject, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, description ?? null, "Асуултын сан", actor.id, createdAt],
    );

    return toQuestionBank(db, await findQuestionBankById(db, id));
  },
  createQuestion: async ({
    bankId,
    type,
    title,
    prompt,
    options,
    correctAnswer,
    difficulty,
    tags,
  }: CreateQuestionArgs) => {
    await findQuestionBankById(db, bankId);
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
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
  updateQuestion: async ({
    id,
    type,
    title,
    prompt,
    options,
    correctAnswer,
    difficulty,
    tags,
  }: UpdateQuestionArgs) => {
    const question = await findQuestionById(db, id);
    await requireActor(db, ["ADMIN", "TEACHER"]);

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
  deleteQuestion: async ({ id }: DeleteQuestionArgs) => {
    await findQuestionById(db, id);
    await requireActor(db, ["ADMIN", "TEACHER"]);
    await run(db, "DELETE FROM questions WHERE id = ?", [id]);
    return true;
  },
});
