import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import {
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type ApproveExamImportJobArgs,
  type ByIdArgs,
  type CreateExamImportJobArgs,
  type Difficulty,
  type ExamImportJobRow,
  type ExamImportQuestionRow,
  type QuestionBankRow,
  type QuestionType,
  type Role,
  type UserRow,
} from "../types";

const importJobSelectFields = `id,
      teacher_id,
      question_bank_id,
      file_name,
      file_size_bytes,
      source_type,
      status,
      title,
      extracted_text,
      parsed_exam_json,
      error_message,
      created_at,
      updated_at`;

const importQuestionSelectFields = `id,
      job_id,
      display_order,
      type,
      title,
      prompt,
      options_json,
      answers_json,
      score,
      difficulty,
      source_page,
      confidence,
      needs_review,
      created_at`;

type DraftQuestion = {
  type: QuestionType;
  title: string;
  prompt: string;
  options: string[];
  answers: string[];
  score: number;
  difficulty: Difficulty;
  sourcePage: number;
  confidence: number;
  needsReview: boolean;
};

const stripPdfExtension = (fileName: string) =>
  fileName.replace(/\.pdf$/i, "").trim();

const toImportTitle = (fileName: string) => {
  const normalized = stripPdfExtension(fileName)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.length > 0 ? normalized : "PDF импорт шалгалт";
};

const buildDraftQuestions = (title: string): DraftQuestion[] => [
  {
    type: "MCQ",
    title: `${title} - Асуулт 1`,
    prompt: "Монгол Улсын нийслэл аль нь вэ?",
    options: ["Улаанбаатар", "Дархан", "Эрдэнэт", "Чойбалсан"],
    answers: ["Улаанбаатар"],
    score: 1,
    difficulty: "EASY",
    sourcePage: 1,
    confidence: 0.94,
    needsReview: false,
  },
  {
    type: "TRUE_FALSE",
    title: `${title} - Асуулт 2`,
    prompt: "1 километр нь 1000 метртэй тэнцүү.",
    options: ["True", "False"],
    answers: ["True"],
    score: 1,
    difficulty: "EASY",
    sourcePage: 1,
    confidence: 0.91,
    needsReview: false,
  },
  {
    type: "SHORT_ANSWER",
    title: `${title} - Асуулт 3`,
    prompt: "12 * 8 = ?",
    options: [],
    answers: ["96"],
    score: 2,
    difficulty: "MEDIUM",
    sourcePage: 2,
    confidence: 0.63,
    needsReview: true,
  },
];

const toParsedExamJson = (title: string, questions: DraftQuestion[]) =>
  JSON.stringify({
    title,
    questions: questions.map((question, index) => ({
      id: `draft_${index + 1}`,
      type: question.type,
      title: question.title,
      prompt: question.prompt,
      options: question.options,
      answers: question.answers,
      score: question.score,
      difficulty: question.difficulty,
      sourcePage: question.sourcePage,
      confidence: question.confidence,
      needsReview: question.needsReview,
    })),
  });

export const findExamImportJobById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<ExamImportJobRow> => {
  const row = await first<ExamImportJobRow>(
    db,
    `SELECT
      ${importJobSelectFields}
    FROM exam_import_jobs
    WHERE id = ?`,
    [id],
  );
  invariant(row, `Exam import job ${id} not found`);
  return row;
};

const listImportQuestions = async (
  db: D1DatabaseLike,
  jobId: string,
): Promise<ExamImportQuestionRow[]> =>
  all<ExamImportQuestionRow>(
    db,
    `SELECT
      ${importQuestionSelectFields}
    FROM exam_import_questions
    WHERE job_id = ?
    ORDER BY display_order ASC, created_at ASC`,
    [jobId],
  );

const findScopedImportJob = async (
  db: D1DatabaseLike,
  id: string,
  actor: UserRow,
): Promise<ExamImportJobRow | null> =>
  actor.role === "ADMIN"
    ? first<ExamImportJobRow>(
        db,
        `SELECT
          ${importJobSelectFields}
        FROM exam_import_jobs
        WHERE id = ?`,
        [id],
      )
    : first<ExamImportJobRow>(
        db,
        `SELECT
          ${importJobSelectFields}
        FROM exam_import_jobs
        WHERE id = ? AND teacher_id = ?`,
        [id, actor.id],
      );

type ImportModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  findQuestionBank: (db: D1DatabaseLike, id: string) => Promise<QuestionBankRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toUser: (user: UserRow) => unknown;
};

export const createImportQueriesAndMutations = ({
  db,
  requireActor,
  findQuestionBank,
  findUser,
  toQuestionBank,
  toUser,
}: ImportModuleDependencies) => {
  const toExamImportQuestion = (row: ExamImportQuestionRow) => ({
    id: row.id,
    order: row.display_order,
    type: row.type,
    title: row.title,
    prompt: row.prompt,
    options: parseJsonArray(row.options_json),
    answers: parseJsonArray(row.answers_json),
    score: row.score,
    difficulty: row.difficulty,
    sourcePage: row.source_page,
    confidence: row.confidence,
    needsReview: Boolean(row.needs_review),
    createdAt: row.created_at,
  });

  const toExamImportJob = (row: ExamImportJobRow) => ({
    id: row.id,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    sourceType: row.source_type,
    status: row.status,
    title: row.title,
    extractedText: row.extracted_text,
    errorMessage: row.error_message,
    totalQuestions: async () =>
      (await first<{ count: number | null }>(
        db,
        "SELECT COUNT(*) AS count FROM exam_import_questions WHERE job_id = ?",
        [row.id],
      ))?.count ?? 0,
    reviewCount: async () =>
      (await first<{ count: number | null }>(
        db,
        "SELECT COUNT(*) AS count FROM exam_import_questions WHERE job_id = ? AND needs_review = 1",
        [row.id],
      ))?.count ?? 0,
    questionBank: async () =>
      row.question_bank_id
        ? toQuestionBank(db, await findQuestionBank(db, row.question_bank_id))
        : null,
    createdBy: async () => toUser(await findUser(db, row.teacher_id)),
    questions: async () => (await listImportQuestions(db, row.id)).map(toExamImportQuestion),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  return {
    examImportJobs: async (_args: unknown, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const rows =
        actor.role === "ADMIN"
          ? await all<ExamImportJobRow>(
              db,
              `SELECT
                ${importJobSelectFields}
              FROM exam_import_jobs
              ORDER BY updated_at DESC`,
            )
          : await all<ExamImportJobRow>(
              db,
              `SELECT
                ${importJobSelectFields}
              FROM exam_import_jobs
              WHERE teacher_id = ?
              ORDER BY updated_at DESC`,
              [actor.id],
            );
      return rows.map(toExamImportJob);
    },
    examImportJob: async ({ id }: ByIdArgs, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const row = await findScopedImportJob(db, id, actor);
      return row ? toExamImportJob(row) : null;
    },
    createExamImportJob: async (
      { fileName, fileSizeBytes }: CreateExamImportJobArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const id = makeId("import");
      const createdAt = now();
      const title = toImportTitle(fileName);
      const questions = buildDraftQuestions(title);

      await run(
        db,
        `INSERT INTO exam_import_jobs (
          id,
          teacher_id,
          question_bank_id,
          file_name,
          file_size_bytes,
          source_type,
          status,
          title,
          extracted_text,
          parsed_exam_json,
          error_message,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          actor.id,
          null,
          fileName.trim(),
          fileSizeBytes,
          "PDF",
          "REVIEW",
          title,
          null,
          toParsedExamJson(title, questions),
          null,
          createdAt,
          createdAt,
        ],
      );

      for (const [index, question] of questions.entries()) {
        await run(
          db,
          `INSERT INTO exam_import_questions (
            id,
            job_id,
            display_order,
            type,
            title,
            prompt,
            options_json,
            answers_json,
            score,
            difficulty,
            source_page,
            confidence,
            needs_review,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId("import_question"),
            id,
            index + 1,
            question.type,
            question.title,
            question.prompt,
            toJsonArray(question.options),
            toJsonArray(question.answers),
            question.score,
            question.difficulty,
            question.sourcePage,
            question.confidence,
            question.needsReview ? 1 : 0,
            createdAt,
          ],
        );
      }

      return toExamImportJob(await findExamImportJobById(db, id));
    },
    approveExamImportJob: async (
      { id }: ApproveExamImportJobArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const job = await findScopedImportJob(db, id, actor);
      invariant(job, "PDF импортын ажил олдсонгүй.");

      if (job.status === "APPROVED" && job.question_bank_id) {
        return toExamImportJob(job);
      }

      const bankId = makeId("bank");
      const updatedAt = now();
      const bankTitle = `${job.title} PDF import`;
      const bankDescription = `${job.file_name} файлаас үүсгэсэн асуултын сан`;
      const questions = await listImportQuestions(db, job.id);

      await run(
        db,
        `INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bankId,
          bankTitle,
          bankDescription,
          10,
          "Ерөнхий",
          "PDF импорт",
          "PRIVATE",
          job.teacher_id,
          updatedAt,
        ],
      );

      for (const question of questions) {
        const answers = parseJsonArray(question.answers_json);
        const options =
          question.type === "TRUE_FALSE"
            ? ["True", "False"]
            : parseJsonArray(question.options_json);
        const correctAnswer = answers[0] ?? null;
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
            makeId("question"),
            bankId,
            question.type,
            question.title,
            question.prompt,
            toJsonArray(options),
            correctAnswer,
            question.difficulty,
            toJsonArray(["import:pdf", `job:${job.id}`]),
            job.teacher_id,
            updatedAt,
          ],
        );
      }

      await run(
        db,
        `UPDATE exam_import_jobs
         SET status = ?, question_bank_id = ?, updated_at = ?
         WHERE id = ?`,
        ["APPROVED", bankId, updatedAt, job.id],
      );

      return toExamImportJob(await findExamImportJobById(db, job.id));
    },
  };
};
