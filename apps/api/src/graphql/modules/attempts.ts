import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import {
  makeId,
  normalize,
  now,
  type AnswerRow,
  type AttemptRow,
  type ExamQuestionRow,
  type ExamRow,
  type QuestionRow,
  type SaveAnswerArgs,
  type StartAttemptArgs,
  type SubmitAttemptArgs,
  type UserRow,
} from "../types";

export const findAttemptById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<AttemptRow> => {
  const attempt = await first<AttemptRow>(
    db,
    `SELECT
      id,
      exam_id,
      student_id,
      status,
      auto_score,
      manual_score,
      total_score,
      started_at,
      submitted_at
    FROM attempts
    WHERE id = ?`,
    [id],
  );
  invariant(attempt, `Attempt ${id} not found`);
  return attempt;
};

const findLatestAttemptForExamStudent = async (
  db: D1DatabaseLike,
  examId: string,
  studentId: string,
): Promise<AttemptRow | null> =>
  first<AttemptRow>(
    db,
    `SELECT
      id,
      exam_id,
      student_id,
      status,
      auto_score,
      manual_score,
      total_score,
      started_at,
      submitted_at
    FROM attempts
    WHERE exam_id = ? AND student_id = ?
    ORDER BY started_at DESC
    LIMIT 1`,
    [examId, studentId],
  );

const scoreAnswer = (
  question: QuestionRow,
  value: string,
  examQuestion: ExamQuestionRow | null,
): number | null => {
  if (!examQuestion) {
    return null;
  }

  if (question.type === "ESSAY" || question.type === "IMAGE_UPLOAD") {
    return null;
  }

  if (!question.correct_answer) {
    return 0;
  }

  return normalize(question.correct_answer) === normalize(value)
    ? examQuestion.points
    : 0;
};

export const recalculateAttemptScores = async (
  db: D1DatabaseLike,
  attemptId: string,
): Promise<void> => {
  const aggregate =
    (await first<{ auto_score: number | null; manual_score: number | null }>(
      db,
      `SELECT
        COALESCE(SUM(auto_score), 0) AS auto_score,
        COALESCE(SUM(manual_score), 0) AS manual_score
      FROM answers
      WHERE attempt_id = ?`,
      [attemptId],
    )) ?? { auto_score: 0, manual_score: 0 };

  const autoScore = aggregate.auto_score ?? 0;
  const manualScore = aggregate.manual_score ?? 0;

  await run(
    db,
    `UPDATE attempts
     SET auto_score = ?, manual_score = ?, total_score = ?
     WHERE id = ?`,
    [autoScore, manualScore, autoScore + manualScore, attemptId],
  );
};

type AttemptMutationDependencies = {
  db: D1DatabaseLike;
  findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  findQuestion: (db: D1DatabaseLike, id: string) => Promise<QuestionRow>;
  toAttempt: (db: D1DatabaseLike, attempt: AttemptRow) => unknown;
};

export const createAttemptMutations = ({
  db,
  findExam,
  findUser,
  findQuestion,
  toAttempt,
}: AttemptMutationDependencies) => ({
  startAttempt: async ({ examId, studentId }: StartAttemptArgs) => {
    const exam = await findExam(db, examId);
    invariant(
      exam.status === "PUBLISHED",
      "Only published exams can be started.",
    );
    await findUser(db, studentId);

    const existingAttempt = await findLatestAttemptForExamStudent(
      db,
      examId,
      studentId,
    );

    if (existingAttempt) {
      return toAttempt(db, existingAttempt);
    }

    const id = makeId("attempt");
    const startedAt = now();

    await run(
      db,
      `INSERT INTO attempts (
        id,
        exam_id,
        student_id,
        status,
        auto_score,
        manual_score,
        total_score,
        started_at,
        submitted_at
      )
      VALUES (?, ?, ?, ?, 0, 0, 0, ?, NULL)`,
      [id, examId, studentId, "IN_PROGRESS", startedAt],
    );

    return toAttempt(db, await findAttemptById(db, id));
  },
  saveAnswer: async ({ attemptId, questionId, value }: SaveAnswerArgs) => {
    const attempt = await findAttemptById(db, attemptId);
    invariant(attempt.status === "IN_PROGRESS", "Only in-progress attempts can be edited.");

    const question = await findQuestion(db, questionId);
    const examQuestion = await first<ExamQuestionRow>(
      db,
      `SELECT id, exam_id, question_id, points, display_order
       FROM exam_questions
       WHERE exam_id = ? AND question_id = ?`,
      [attempt.exam_id, questionId],
    );
    invariant(examQuestion, "This question is not part of the attempt's exam.");

    const existing = await first<AnswerRow>(
      db,
      `SELECT
        id,
        attempt_id,
        question_id,
        value,
        auto_score,
        manual_score,
        feedback,
        created_at
       FROM answers
       WHERE attempt_id = ? AND question_id = ?`,
      [attemptId, questionId],
    );
    const autoScore = scoreAnswer(question, value, examQuestion);

    if (existing) {
      await run(
        db,
        `UPDATE answers
         SET value = ?, auto_score = ?
         WHERE id = ?`,
        [value, autoScore, existing.id],
      );
    } else {
      await run(
        db,
        `INSERT INTO answers (
          id,
          attempt_id,
          question_id,
          value,
          auto_score,
          manual_score,
          feedback,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, NULL, NULL, ?)`,
        [makeId("answer"), attemptId, questionId, value, autoScore, now()],
      );
    }

    await recalculateAttemptScores(db, attemptId);
    return toAttempt(db, await findAttemptById(db, attemptId));
  },
  submitAttempt: async ({ attemptId }: SubmitAttemptArgs) => {
    const attempt = await findAttemptById(db, attemptId);

    if (attempt.status === "SUBMITTED" || attempt.status === "GRADED") {
      return toAttempt(db, attempt);
    }

    invariant(
      attempt.status === "IN_PROGRESS",
      "Only in-progress attempts can be submitted.",
    );

    await recalculateAttemptScores(db, attemptId);
    await run(
      db,
      `UPDATE attempts
       SET status = 'SUBMITTED', submitted_at = ?
       WHERE id = ?`,
      [now(), attemptId],
    );
    return toAttempt(db, await findAttemptById(db, attemptId));
  },
});
