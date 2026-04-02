import { all, first, invariant, run, runMany, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import { parseImportedExamText, type ParsedImportQuestion } from "./imports-parser";
import { appendQuestionToExam } from "./exams";
import {
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type ApproveExamImportJobArgs,
  type ByIdArgs,
  type CreateExamImportJobArgs,
  type ExamImportJobRow,
  type ExamImportQuestionRow,
  type ExamRow,
  type QuestionBankRow,
  type ReviewedExamImportQuestionInput,
  type Role,
  type UserRow,
} from "../types";

const importJobSelectFields = `id,
      teacher_id,
      question_bank_id,
      exam_id,
      storage_key,
      file_name,
      file_size_bytes,
      source_type,
      status,
      title,
      extracted_text,
      extraction_json,
      classifier_json,
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
      source_excerpt,
      source_block_id,
      source_bbox_json,
      confidence,
      needs_review,
      created_at`;

const stripImportExtension = (fileName: string) =>
  fileName.replace(/\.(pdf|png|jpe?g|webp|gif|bmp)$/i, "").trim();

const toImportTitle = (fileName: string) => {
  const normalized = stripImportExtension(fileName)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.length > 0 ? normalized : "Импорт шалгалт";
};

const toParsedExamJson = (title: string, questions: ParsedImportQuestion[]) =>
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
      sourceExcerpt: question.sourceExcerpt,
      confidence: question.confidence,
      sourceBlockId: question.sourceBlockId,
      sourceBboxJson: question.sourceBboxJson,
      needsReview: question.needsReview,
    })),
  });

const insertImportQuestions = async (
  db: D1DatabaseLike,
  jobId: string,
  createdAt: string,
  questions: ParsedImportQuestion[],
) => {
  await runMany(
    db,
    questions.map((question, index) => ({
      sql: `INSERT INTO exam_import_questions (
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
        source_excerpt,
        source_block_id,
        source_bbox_json,
        confidence,
        needs_review,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        makeId("import_question"),
        jobId,
        index + 1,
        question.type,
        question.title,
        question.prompt,
        toJsonArray(question.options),
        toJsonArray(question.answers),
        question.score,
        question.difficulty,
        question.sourcePage,
        question.sourceExcerpt,
        question.sourceBlockId,
        question.sourceBboxJson,
        question.confidence,
        question.needsReview ? 1 : 0,
        createdAt,
      ],
    })),
  );
};

const normalizeReviewedQuestion = (
  question: ReviewedExamImportQuestionInput,
  fallbackOrder: number,
): ParsedImportQuestion => {
  const normalizedPrompt = question.prompt.trim();
  const normalizedType = question.type;
  const normalizedOptions =
    normalizedType === "TRUE_FALSE"
      ? ["True", "False"]
      : question.options.map((option) => option.trim()).filter(Boolean);
  const normalizedAnswers = question.answers.map((answer) => answer.trim()).filter(Boolean);
  const normalizedTitle = question.title.trim() || `Асуулт ${question.order || fallbackOrder}`;

  return {
    type: normalizedType,
    title: normalizedTitle,
    prompt: normalizedPrompt,
    options: normalizedOptions,
    answers: normalizedAnswers,
    score: Math.max(1, Math.round(question.score || 1)),
    difficulty: question.difficulty,
    sourcePage: question.sourcePage ?? fallbackOrder,
    sourceExcerpt: question.sourceExcerpt?.trim() || normalizedPrompt,
    sourceBlockId: question.sourceBlockId?.trim() || `review-block-${question.order || fallbackOrder}`,
    sourceBboxJson: question.sourceBboxJson?.trim() || null,
    confidence: Math.max(0, Math.min(1, question.confidence)),
    needsReview:
      question.needsReview ||
      !normalizedPrompt ||
      ((normalizedType === "MCQ" || normalizedType === "TRUE_FALSE") && normalizedAnswers.length === 0),
  };
};

const replaceImportQuestions = async (
  db: D1DatabaseLike,
  jobId: string,
  updatedAt: string,
  questions: ReviewedExamImportQuestionInput[],
) => {
  const normalizedQuestions = questions.map((question, index) =>
    normalizeReviewedQuestion(question, index + 1),
  );

  await run(db, "DELETE FROM exam_import_questions WHERE job_id = ?", [jobId]);
  await insertImportQuestions(db, jobId, updatedAt, normalizedQuestions);

  return normalizedQuestions;
};

const estimateDurationMinutes = (questions: ExamImportQuestionRow[]) =>
  Math.max(
    20,
    Math.min(
      180,
      questions.reduce((total, question) => total + Math.max(1, question.score) * 2, 0),
    ),
  );

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
  findClass: (
    db: D1DatabaseLike,
    id: string,
  ) => Promise<{ id: string; teacher_id: string; grade: number; subject: string }>;
  findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>;
  findQuestionBank: (db: D1DatabaseLike, id: string) => Promise<QuestionBankRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toExam: (db: D1DatabaseLike, exam: ExamRow) => unknown;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toUser: (user: UserRow) => unknown;
};

export const createImportQueriesAndMutations = ({
  db,
  requireActor,
  findClass,
  findExam,
  findQuestionBank,
  findUser,
  toExam,
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
    sourceExcerpt: row.source_excerpt,
    sourceBlockId: row.source_block_id,
    sourceBboxJson: row.source_bbox_json,
    confidence: row.confidence,
    needsReview: Boolean(row.needs_review),
    createdAt: row.created_at,
  });

  const toExamImportJob = (row: ExamImportJobRow) => ({
    id: row.id,
    storageKey: row.storage_key,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    sourceType: row.source_type,
    status: row.status,
    title: row.title,
    extractedText: row.extracted_text,
    extractionJson: row.extraction_json,
    classifierJson: row.classifier_json,
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
    exam: async () => (row.exam_id ? toExam(db, await findExam(db, row.exam_id)) : null),
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
      { fileName, fileSizeBytes, extractedText, sourceType, storageKey, extractionJson, classifierJson }: CreateExamImportJobArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const id = makeId("import");
      const createdAt = now();
      const fallbackTitle = toImportTitle(fileName);
      const normalizedExtractedText = extractedText.trim();

      await run(
        db,
        `INSERT INTO exam_import_jobs (
          id,
          teacher_id,
          question_bank_id,
          exam_id,
          storage_key,
          file_name,
          file_size_bytes,
          source_type,
          status,
          title,
          extracted_text,
          extraction_json,
          classifier_json,
          parsed_exam_json,
          error_message,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          actor.id,
          null,
          null,
          storageKey?.trim() || null,
          fileName.trim(),
          fileSizeBytes,
          sourceType,
          "UPLOADED",
          fallbackTitle,
          normalizedExtractedText || null,
          extractionJson?.trim() || null,
          classifierJson?.trim() || null,
          toParsedExamJson(fallbackTitle, []),
          null,
          createdAt,
          createdAt,
        ],
      );

      await run(
        db,
        `UPDATE exam_import_jobs
         SET status = ?, updated_at = ?
         WHERE id = ?`,
        ["PROCESSING", createdAt, id],
      );

      if (!normalizedExtractedText) {
        await run(
          db,
          `UPDATE exam_import_jobs
           SET status = ?, error_message = ?, updated_at = ?
           WHERE id = ?`,
          ["FAILED", "PDF файлаас text гаргаж чадсангүй.", createdAt, id],
        );
        return toExamImportJob(await findExamImportJobById(db, id));
      }

      const parsedExam = parseImportedExamText(normalizedExtractedText, fallbackTitle, extractionJson);
      const nextStatus = parsedExam.questions.length > 0 ? "REVIEW" : "FAILED";
      await insertImportQuestions(db, id, createdAt, parsedExam.questions);
      await run(
        db,
        `UPDATE exam_import_jobs
         SET status = ?, title = ?, parsed_exam_json = ?, error_message = ?, updated_at = ?
         WHERE id = ?`,
        [
          nextStatus,
          parsedExam.title,
          toParsedExamJson(parsedExam.title, parsedExam.questions),
          nextStatus === "FAILED" ? "PDF parsing амжилтгүй боллоо." : null,
          createdAt,
          id,
        ],
      );

      return toExamImportJob(await findExamImportJobById(db, id));
    },
    approveExamImportJob: async (
      { id, classId, questions: reviewedQuestions }: ApproveExamImportJobArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const job = await findScopedImportJob(db, id, actor);
      invariant(job, "PDF импортын ажил олдсонгүй.");
      const classroom = await findClass(db, classId);
      if (actor.role === "TEACHER") {
        invariant(
          classroom.teacher_id === actor.id,
          "Зөвхөн өөрийн ангид импортолсон шалгалтыг холбож болно.",
        );
      }

      if (job.status === "PUBLISHED" && job.question_bank_id && job.exam_id) {
        return toExamImportJob(job);
      }

      const bankId = makeId("bank");
      const examId = makeId("exam");
      const updatedAt = now();
      const bankTitle = `${job.title} import`;
      const bankDescription = `${job.file_name} файлаас үүсгэсэн асуултын сан`;
      invariant(reviewedQuestions.length > 0, "Дор хаяж нэг асуултыг баталгаажуулна уу.");
      const normalizedQuestions = await replaceImportQuestions(db, job.id, updatedAt, reviewedQuestions);
      await run(
        db,
        `UPDATE exam_import_jobs
         SET parsed_exam_json = ?, updated_at = ?
         WHERE id = ?`,
        [toParsedExamJson(job.title, normalizedQuestions), updatedAt, job.id],
      );
      const questions = await listImportQuestions(db, job.id);
      const durationMinutes = estimateDurationMinutes(questions);
      const examDescription = `${job.file_name} файлаас импортолсон шалгалтын ноорог`;
      const insertedQuestionIds: string[] = [];

      await run(
        db,
        `INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bankId,
          bankTitle,
          bankDescription,
          classroom.grade,
          classroom.subject,
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
        const nextQuestionId = makeId("question");
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
            nextQuestionId,
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
        insertedQuestionIds.push(nextQuestionId);
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
          examId,
          classId,
          1,
          null,
          job.title,
          examDescription,
          "SCHEDULED",
          "DRAFT",
          durationMinutes,
          null,
          null,
          job.teacher_id,
          updatedAt,
          0,
          0,
          "MANUAL",
          "[]",
          "PERCENTAGE",
          40,
          updatedAt,
        ],
      );

      for (const [questionIndex, question] of questions.entries()) {
        const insertedQuestionId = insertedQuestionIds[questionIndex];
        invariant(insertedQuestionId, "Импортолсон асуултыг шалгалттай холбоход алдаа гарлаа.");
        await appendQuestionToExam(db, examId, insertedQuestionId, question.score);
      }

      await run(
        db,
        `UPDATE exam_import_jobs
         SET status = ?, question_bank_id = ?, exam_id = ?, updated_at = ?
         WHERE id = ?`,
        ["PUBLISHED", bankId, examId, updatedAt, job.id],
      );

      return toExamImportJob(await findExamImportJobById(db, job.id));
    },
  };
};
