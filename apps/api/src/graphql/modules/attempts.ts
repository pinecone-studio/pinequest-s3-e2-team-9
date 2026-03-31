import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import { closeExpiredExams } from "./exams";
import type { RequestContext } from "../../auth";
import type { LiveExamMutationEvent } from "../../live-exam-events";
import {
  type AttemptIntegrityEventRow,
  type AttemptIntegrityEventType,
  makeId,
  type IntegritySeverity,
  normalize,
  now,
  type RecordAttemptIntegrityEventArgs,
  parseJsonArray,
  parseNumericAnswer,
  splitAcceptedAnswers,
  normalizeShortAnswer,
  type AnswerRow,
  type AttemptRow,
  type ExamQuestionRow,
  type ExamRow,
  type QuestionRow,
  type ReviewAnswerArgs,
  type ReviewAttemptArgs,
  type SaveAnswerArgs,
  type StartAttemptArgs,
  type SubmitAttemptArgs,
  type Role,
  type UserRow,
} from "../types";

const integrityEventSeverity: Record<
  AttemptIntegrityEventType,
  IntegritySeverity
> = {
  TAB_HIDDEN: "MEDIUM",
  WINDOW_BLUR: "LOW",
  FULLSCREEN_EXIT: "MEDIUM",
  PASTE_ATTEMPT: "HIGH",
  COPY_ATTEMPT: "MEDIUM",
  BULK_INPUT_BURST: "HIGH",
  INACTIVE_THEN_BULK_INPUT: "HIGH",
};

const INTEGRITY_EVENT_DEDUPE_WINDOW_MS = 3_000;
const MAX_INTEGRITY_DETAILS_LENGTH = 1_200;

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
      generation_seed,
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
      generation_seed,
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

  if (question.type === "SHORT_ANSWER") {
    const toleranceTag = parseJsonArray(question.tags_json).find((tag) =>
      tag.startsWith("tolerance:"),
    );
    const toleranceValue = Number(toleranceTag?.replace("tolerance:", "") ?? "");
    const tolerance = Number.isFinite(toleranceValue) ? Math.max(0, toleranceValue) : 0;
    const submittedNormalized = normalizeShortAnswer(value);
    const submittedNumeric = parseNumericAnswer(value);
    const acceptedAnswers = splitAcceptedAnswers(question.correct_answer);

    const matches = acceptedAnswers.some((accepted) => {
      if (normalizeShortAnswer(accepted) === submittedNormalized) {
        return true;
      }

      const acceptedNumeric = parseNumericAnswer(accepted);
      if (acceptedNumeric === null || submittedNumeric === null) {
        return false;
      }

      return Math.abs(acceptedNumeric - submittedNumeric) <= tolerance;
    });

    return matches ? examQuestion.points : 0;
  }

  return normalize(question.correct_answer) === normalize(value)
    ? examQuestion.points
    : 0;
};

const buildAttemptSeed = (examId: string, studentId: string) =>
  `${examId}:${studentId}`;

const roundScore = (value: number) => Math.round(value * 10) / 10;
type ReviewableAnswerRow = AnswerRow & {
  points: number | null;
};

const answerNeedsManualReview = (answer: Pick<AnswerRow, "auto_score">) =>
  answer.auto_score === null;

const normalizeFeedback = (feedback: string | null | undefined) => {
  const trimmed = feedback?.trim();
  return trimmed ? trimmed : null;
};

const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(value, key);

const findTeacherIdForAttempt = async (
  db: D1DatabaseLike,
  attemptId: string,
): Promise<string | null> =>
  (
    await first<{ teacher_id: string }>(
      db,
      `SELECT c.teacher_id AS teacher_id
       FROM attempts a
       JOIN exams e ON e.id = a.exam_id
       JOIN classes c ON c.id = e.class_id
       WHERE a.id = ?`,
      [attemptId],
    )
  )?.teacher_id ?? null;

const listAttemptAnswersForReview = async (
  db: D1DatabaseLike,
  attempt: AttemptRow,
): Promise<ReviewableAnswerRow[]> =>
  all<ReviewableAnswerRow>(
    db,
    `SELECT
      ans.id,
      ans.attempt_id,
      ans.question_id,
      ans.value,
      ans.auto_score,
      ans.manual_score,
      ans.feedback,
      ans.created_at,
      eq.points
     FROM answers ans
     LEFT JOIN exam_questions eq
       ON eq.exam_id = ? AND eq.question_id = ans.question_id
     WHERE ans.attempt_id = ?
     ORDER BY ans.created_at ASC`,
    [attempt.exam_id, attempt.id],
  );

const attemptNeedsManualReview = async (
  db: D1DatabaseLike,
  attemptId: string,
): Promise<boolean> => {
  const aggregate =
    await first<{ review_count: number }>(
      db,
      `SELECT COUNT(*) AS review_count
       FROM answers
       WHERE attempt_id = ? AND auto_score IS NULL`,
      [attemptId],
    );

  return (aggregate?.review_count ?? 0) > 0;
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
  const roundedAutoScore = roundScore(autoScore);
  const roundedManualScore = roundScore(manualScore);
  const roundedTotalScore = roundScore(roundedAutoScore + roundedManualScore);

  await run(
    db,
    `UPDATE attempts
     SET auto_score = ?, manual_score = ?, total_score = ?
     WHERE id = ?`,
    [roundedAutoScore, roundedManualScore, roundedTotalScore, attemptId],
  );
};

const findAnswerById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<AnswerRow> => {
  const answer = await first<AnswerRow>(
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
     WHERE id = ?`,
    [id],
  );
  invariant(answer, `Answer ${id} not found`);
  return answer;
};

const findLatestIntegrityEventByType = async (
  db: D1DatabaseLike,
  attemptId: string,
  eventType: AttemptIntegrityEventType,
): Promise<AttemptIntegrityEventRow | null> =>
  first<AttemptIntegrityEventRow>(
    db,
    `SELECT
      id,
      attempt_id,
      exam_id,
      student_id,
      event_type,
      severity,
      details_json,
      created_at
     FROM attempt_integrity_events
     WHERE attempt_id = ? AND event_type = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [attemptId, eventType],
  );

const countIntegrityEventsByType = async (
  db: D1DatabaseLike,
  attemptId: string,
  eventType: AttemptIntegrityEventType,
): Promise<number> =>
  (await first<{ count: number | null }>(
    db,
    `SELECT COUNT(*) AS count
     FROM attempt_integrity_events
     WHERE attempt_id = ? AND event_type = ?`,
    [attemptId, eventType],
  ))?.count ?? 0;

const sanitizeIntegrityDetails = (details?: string): string => {
  const trimmed = details?.trim();

  if (!trimmed) {
    return "{}";
  }

  const normalized = trimmed.slice(0, MAX_INTEGRITY_DETAILS_LENGTH);

  try {
    JSON.parse(normalized);
    return normalized;
  } catch {
    return JSON.stringify({ message: normalized });
  }
};

type AttemptMutationDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  findQuestion: (db: D1DatabaseLike, id: string) => Promise<QuestionRow>;
  publishLiveEvent?: (event: LiveExamMutationEvent) => Promise<void>;
  toAttempt: (db: D1DatabaseLike, attempt: AttemptRow) => unknown;
  toAnswer: (answer: AnswerRow) => unknown;
};

export const createAttemptMutations = ({
  db,
  requireActor,
  findExam,
  findUser,
  findQuestion,
  publishLiveEvent,
  toAttempt,
  toAnswer,
}: AttemptMutationDependencies) => ({
  startAttempt: async (
    { examId, studentId }: StartAttemptArgs,
    context: RequestContext,
  ) => {
    await closeExpiredExams(db);
    const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
    const exam = await findExam(db, examId);
    invariant(
      exam.status === "PUBLISHED",
      "Only published exams can be started.",
    );
    const effectiveStudentId =
      actor.role === "STUDENT" ? actor.id : studentId;

    if (actor.role === "STUDENT") {
      invariant(
        studentId === actor.id,
        "Students can only start their own attempts.",
      );
    }

    await findUser(db, effectiveStudentId);

    const existingAttempt = await findLatestAttemptForExamStudent(
      db,
      examId,
      effectiveStudentId,
    );

    if (existingAttempt && (exam.mode !== "PRACTICE" || existingAttempt.status === "IN_PROGRESS")) {
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
        generation_seed,
        started_at,
        submitted_at
      )
      VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?, NULL)`,
      [
        id,
        examId,
        effectiveStudentId,
        "IN_PROGRESS",
        buildAttemptSeed(examId, effectiveStudentId),
        startedAt,
      ],
    );

    const createdAttempt = await findAttemptById(db, id);
    await publishLiveEvent?.({
      type: "attempt_started",
      attemptId: createdAttempt.id,
      classId: exam.class_id,
      emittedAt: now(),
      examId,
      startedAt: createdAttempt.started_at,
      status: "IN_PROGRESS",
      studentId: effectiveStudentId,
      submittedAt: null,
    });

    return toAttempt(db, createdAttempt);
  },
  saveAnswer: async (
    { attemptId, questionId, value }: SaveAnswerArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
    const attempt = await findAttemptById(db, attemptId);
    const exam = await findExam(db, attempt.exam_id);
    if (actor.role === "STUDENT") {
      invariant(
        attempt.student_id === actor.id,
        "Students can only update their own attempts.",
      );
    }
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
  recordAttemptIntegrityEvent: async (
    { attemptId, type, details }: RecordAttemptIntegrityEventArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
    const attempt = await findAttemptById(db, attemptId);

    if (actor.role === "STUDENT") {
      invariant(
        attempt.student_id === actor.id,
        "Students can only flag their own attempts.",
      );
    }

    invariant(
      attempt.status === "IN_PROGRESS",
      "Only in-progress attempts can record integrity events.",
    );

    const latestEvent = await findLatestIntegrityEventByType(db, attemptId, type);
    const latestTimestamp = latestEvent?.created_at
      ? new Date(latestEvent.created_at).getTime()
      : Number.NaN;

    if (
      Number.isFinite(latestTimestamp)
      && Date.now() - latestTimestamp < INTEGRITY_EVENT_DEDUPE_WINDOW_MS
    ) {
      return true;
    }

    await run(
      db,
      `INSERT INTO attempt_integrity_events (
        id,
        attempt_id,
        exam_id,
        student_id,
        event_type,
        severity,
        details_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        makeId("integrity"),
        attempt.id,
        attempt.exam_id,
        attempt.student_id,
        type,
        integrityEventSeverity[type],
        sanitizeIntegrityDetails(details),
        now(),
      ],
    );

    const eventCount = await countIntegrityEventsByType(db, attempt.id, type);
    const exam = await findExam(db, attempt.exam_id);

    await publishLiveEvent?.({
      type: "attempt_integrity_flag",
      attemptId: attempt.id,
      classId: exam.class_id,
      emittedAt: now(),
      eventCount,
      eventType: type,
      examId: attempt.exam_id,
      severity: integrityEventSeverity[type],
      studentId: attempt.student_id,
    });

    return true;
  },
  reviewAnswer: async (
    { answerId, manualScore, feedback }: ReviewAnswerArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    invariant(manualScore >= 0, "Оноо 0-ээс багагүй байна.");
    invariant(
      Math.abs(roundScore(manualScore) - manualScore) < 0.000001,
      "Оноог хамгийн ихдээ нэг орны нарийвчлалтай оруулна уу.",
    );

    const answer = await findAnswerById(db, answerId);
    const attempt = await findAttemptById(db, answer.attempt_id);
    const exam = await findExam(db, attempt.exam_id);
    const question = await findQuestion(db, answer.question_id);
    const examQuestion = await first<ExamQuestionRow>(
      db,
      `SELECT id, exam_id, question_id, points, display_order
       FROM exam_questions
       WHERE exam_id = ? AND question_id = ?`,
      [attempt.exam_id, answer.question_id],
    );
    invariant(examQuestion, "Энэ хариулт шалгалтын асуулттай таарахгүй байна.");

    if (actor.role === "TEACHER") {
      const examClass = await first<{ teacher_id: string }>(
        db,
        `SELECT teacher_id
         FROM classes
         WHERE id = ?`,
        [exam.class_id],
      );
      invariant(
        examClass?.teacher_id === actor.id,
        "Зөвхөн өөрийн ангийн хариултыг үнэлнэ.",
      );
    }

    invariant(
      manualScore <= examQuestion.points,
      `Энэ асуултын оноо ${examQuestion.points}-оос их байж болохгүй.`,
    );

    await run(
      db,
      `UPDATE answers
       SET auto_score = ?, manual_score = ?, feedback = ?
       WHERE id = ?`,
      [
        question.type === "SHORT_ANSWER" ? 0 : answer.auto_score,
        roundScore(manualScore),
        feedback?.trim() || null,
        answerId,
      ],
    );

    await recalculateAttemptScores(db, attempt.id);
    return toAnswer(await findAnswerById(db, answerId));
  },
  submitAttempt: async (
    { attemptId }: SubmitAttemptArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
    const attempt = await findAttemptById(db, attemptId);
    const exam = await findExam(db, attempt.exam_id);
    if (actor.role === "STUDENT") {
      invariant(
        attempt.student_id === actor.id,
        "Students can only submit their own attempts.",
      );
    }

    if (attempt.status === "SUBMITTED" || attempt.status === "GRADED") {
      return toAttempt(db, attempt);
    }

    invariant(
      attempt.status === "IN_PROGRESS",
      "Only in-progress attempts can be submitted.",
    );

    await recalculateAttemptScores(db, attemptId);
    const requiresReview = await attemptNeedsManualReview(db, attemptId);
    const submittedAt = now();
    const nextStatus =
      exam.mode === "PRACTICE" || !requiresReview ? "GRADED" : "SUBMITTED";
    await run(
      db,
      `UPDATE attempts
       SET status = ?, submitted_at = ?
       WHERE id = ?`,
      [nextStatus, submittedAt, attemptId],
    );
    const submittedAttempt = await findAttemptById(db, attemptId);
    const emittedAt = now();

    if (nextStatus === "SUBMITTED") {
      await publishLiveEvent?.({
        type: "attempt_submitted",
        attemptId: submittedAttempt.id,
        classId: exam.class_id,
        emittedAt,
        examId: submittedAttempt.exam_id,
        startedAt: submittedAttempt.started_at,
        status: "SUBMITTED",
        studentId: submittedAttempt.student_id,
        submittedAt: submittedAttempt.submitted_at ?? submittedAt,
      });
    } else {
      await publishLiveEvent?.({
        type: "attempt_reviewed",
        attemptId: submittedAttempt.id,
        classId: exam.class_id,
        emittedAt,
        examId: submittedAttempt.exam_id,
        startedAt: submittedAttempt.started_at,
        status: "GRADED",
        studentId: submittedAttempt.student_id,
        submittedAt: submittedAttempt.submitted_at ?? submittedAt,
      });
    }

    return toAttempt(db, submittedAttempt);
  },
  reviewAttempt: async (
    { attemptId, answers }: ReviewAttemptArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const attempt = await findAttemptById(db, attemptId);

    invariant(
      attempt.status === "SUBMITTED" || attempt.status === "GRADED",
      "Only submitted attempts can be reviewed.",
    );

    if (actor.role === "TEACHER") {
      const teacherId = await findTeacherIdForAttempt(db, attemptId);
      invariant(
        teacherId === actor.id,
        "Teachers can only review attempts for their own classes.",
      );
    }

    const reviewableAnswers = await listAttemptAnswersForReview(db, attempt);
    const answerById = new Map(
      reviewableAnswers.map((answer) => [answer.id, answer]),
    );
    const updatedAnswerIds = new Set<string>();

    for (const review of answers) {
      invariant(
        !updatedAnswerIds.has(review.answerId),
        `Answer ${review.answerId} was provided more than once.`,
      );
      updatedAnswerIds.add(review.answerId);

      const existingAnswer = answerById.get(review.answerId);
      invariant(existingAnswer, `Answer ${review.answerId} not found.`);
      invariant(
        existingAnswer.points !== null,
        `Answer ${review.answerId} is not attached to a scored exam question.`,
      );

      const hasManualScore = hasOwn(review, "manualScore");
      const hasFeedback = hasOwn(review, "feedback");
      const question = await findQuestion(db, existingAnswer.question_id);

      if (!hasManualScore && !hasFeedback) {
        continue;
      }

      let nextManualScore = existingAnswer.manual_score;
      if (hasManualScore) {
        if (review.manualScore === null || review.manualScore === undefined) {
          nextManualScore = null;
        } else {
          const roundedManualScore = roundScore(review.manualScore);
          invariant(
            Number.isFinite(review.manualScore),
            `Manual score for answer ${review.answerId} must be a valid number.`,
          );
          invariant(
            Math.abs(roundedManualScore - review.manualScore) < 0.000001,
            `Manual score for answer ${review.answerId} must have at most one decimal place.`,
          );
          const maxManualScore =
            question.type === "SHORT_ANSWER"
              ? existingAnswer.points
              : Math.max(existingAnswer.points - (existingAnswer.auto_score ?? 0), 0);
          invariant(
            roundedManualScore >= 0 && roundedManualScore <= maxManualScore,
            `Manual score for answer ${review.answerId} must be between 0 and ${maxManualScore}.`,
          );
          nextManualScore = roundedManualScore;
        }
      }

      const nextFeedback = hasFeedback
        ? normalizeFeedback(review.feedback)
        : existingAnswer.feedback;

      await run(
        db,
        `UPDATE answers
         SET auto_score = ?, manual_score = ?, feedback = ?
         WHERE id = ?`,
        [
          question.type === "SHORT_ANSWER" && nextManualScore !== null
            ? 0
            : existingAnswer.auto_score,
          nextManualScore,
          nextFeedback,
          existingAnswer.id,
        ],
      );

      if (question.type === "SHORT_ANSWER" && nextManualScore !== null) {
        existingAnswer.auto_score = 0;
      }
      existingAnswer.manual_score = nextManualScore;
      existingAnswer.feedback = nextFeedback;
    }

    const pendingManualScores = reviewableAnswers.filter(
      (answer) => answerNeedsManualReview(answer) && answer.manual_score === null,
    );
    invariant(
      pendingManualScores.length === 0,
      "Provide a manual score for every answer that requires review.",
    );

    await recalculateAttemptScores(db, attemptId);
    const reviewedAt = now();
    await run(
      db,
      `UPDATE attempts
       SET status = 'GRADED', submitted_at = COALESCE(submitted_at, ?)
       WHERE id = ?`,
      [reviewedAt, attemptId],
    );
    const reviewedAttempt = await findAttemptById(db, attemptId);
    const exam = await findExam(db, reviewedAttempt.exam_id);

    await publishLiveEvent?.({
      type: "attempt_reviewed",
      attemptId: reviewedAttempt.id,
      classId: exam.class_id,
      emittedAt: now(),
      examId: reviewedAttempt.exam_id,
      startedAt: reviewedAttempt.started_at,
      status: "GRADED",
      studentId: reviewedAttempt.student_id,
      submittedAt: reviewedAttempt.submitted_at ?? reviewedAt,
    });

    return toAttempt(db, reviewedAttempt);
  },
});
