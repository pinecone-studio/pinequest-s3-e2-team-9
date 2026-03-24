type Role = "ADMIN" | "TEACHER" | "STUDENT";
type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
type Difficulty = "EASY" | "MEDIUM" | "HARD";
type ExamMode = "SCHEDULED" | "OPEN_WINDOW";
type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

type D1Result<T> = {
  results?: T[];
  success: boolean;
  meta: Record<string, unknown>;
};

export type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<never>>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
};

type ClassRow = {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string;
  created_at: string;
};

type QuestionBankRow = {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
};

type QuestionRow = {
  id: string;
  bank_id: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options_json: string;
  correct_answer: string | null;
  difficulty: Difficulty;
  tags_json: string;
  created_by_id: string;
  created_at: string;
};

type ExamRow = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  mode: ExamMode;
  status: ExamStatus;
  duration_minutes: number;
  created_by_id: string;
  created_at: string;
};

type ExamQuestionRow = {
  id: string;
  exam_id: string;
  question_id: string;
  points: number;
  display_order: number;
};

type AttemptRow = {
  id: string;
  exam_id: string;
  student_id: string;
  status: AttemptStatus;
  auto_score: number;
  manual_score: number;
  total_score: number;
  started_at: string;
  submitted_at: string | null;
};

type AnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  value: string;
  auto_score: number | null;
  manual_score: number | null;
  feedback: string | null;
  created_at: string;
};

type HelloArgs = {
  name?: string;
};

type CreateClassArgs = {
  name: string;
  description?: string;
};

type CreateQuestionBankArgs = {
  title: string;
  description?: string;
};

type CreateQuestionArgs = {
  bankId: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: Difficulty;
  tags?: string[];
};

type CreateExamArgs = {
  classId: string;
  title: string;
  description?: string;
  mode?: ExamMode;
  durationMinutes: number;
};

type AddQuestionToExamArgs = {
  examId: string;
  questionId: string;
  points: number;
};

type PublishExamArgs = {
  examId: string;
};

type StartAttemptArgs = {
  examId: string;
  studentId: string;
};

type SaveAnswerArgs = {
  attemptId: string;
  questionId: string;
  value: string;
};

type SubmitAttemptArgs = {
  attemptId: string;
};

type QuestionsArgs = {
  bankId?: string;
};

type ByIdArgs = {
  id: string;
};

const now = () => new Date().toISOString();

const makeId = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const toJsonArray = (values: string[] | undefined) => JSON.stringify(values ?? []);

const parseJsonArray = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const statement = (
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): D1PreparedStatementLike => {
  const prepared = db.prepare(sql);
  return params.length > 0 ? prepared.bind(...params) : prepared;
};

const all = async <T>(
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> => {
  const result = await statement(db, sql, params).all<T>();
  return result.results ?? [];
};

const first = async <T>(
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): Promise<T | null> => statement(db, sql, params).first<T>();

const run = async (
  db: D1DatabaseLike,
  sql: string,
  params: unknown[] = [],
): Promise<void> => {
  await statement(db, sql, params).run();
};

const findUser = async (db: D1DatabaseLike, id: string): Promise<UserRow> => {
  const user = await first<UserRow>(
    db,
    "SELECT id, full_name, email, role, created_at FROM users WHERE id = ?",
    [id],
  );
  invariant(user, `User ${id} not found`);
  return user;
};

const findClass = async (db: D1DatabaseLike, id: string): Promise<ClassRow> => {
  const classroom = await first<ClassRow>(
    db,
    "SELECT id, name, description, teacher_id, created_at FROM classes WHERE id = ?",
    [id],
  );
  invariant(classroom, `Class ${id} not found`);
  return classroom;
};

const findQuestionBank = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionBankRow> => {
  const bank = await first<QuestionBankRow>(
    db,
    "SELECT id, title, description, owner_id, created_at FROM question_banks WHERE id = ?",
    [id],
  );
  invariant(bank, `Question bank ${id} not found`);
  return bank;
};

const findQuestion = async (
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

const findExam = async (db: D1DatabaseLike, id: string): Promise<ExamRow> => {
  const exam = await first<ExamRow>(
    db,
    `SELECT
      id,
      class_id,
      title,
      description,
      mode,
      status,
      duration_minutes,
      created_by_id,
      created_at
    FROM exams
    WHERE id = ?`,
    [id],
  );
  invariant(exam, `Exam ${id} not found`);
  return exam;
};

const findAttempt = async (
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

const findActor = async (db: D1DatabaseLike): Promise<UserRow | null> =>
  first<UserRow>(
    db,
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY CASE role
       WHEN 'ADMIN' THEN 0
       WHEN 'TEACHER' THEN 1
       ELSE 2
     END, created_at ASC
     LIMIT 1`,
  );

const requireActor = async (
  db: D1DatabaseLike,
  roles: Role[],
): Promise<UserRow> => {
  const actor = await first<UserRow>(
    db,
    `SELECT id, full_name, email, role, created_at
     FROM users
     WHERE role IN (${roles.map(() => "?").join(", ")})
     ORDER BY created_at ASC
     LIMIT 1`,
    roles,
  );
  invariant(
    actor,
    `No ${roles.join("/")} user found. Seed the users table before running this mutation.`,
  );
  return actor;
};

const scoreAnswer = (
  question: QuestionRow,
  value: string,
  examQuestion: ExamQuestionRow | null,
): number | null => {
  if (!examQuestion) {
    return null;
  }

  if (question.type === "ESSAY") {
    return null;
  }

  if (!question.correct_answer) {
    return 0;
  }

  return normalize(question.correct_answer) === normalize(value)
    ? examQuestion.points
    : 0;
};

const recalculateAttemptScores = async (
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

const toUser = (db: D1DatabaseLike, user: UserRow) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  createdAt: user.created_at,
  classes: async () => {
    const rows = await all<ClassRow>(
      db,
      `SELECT DISTINCT
        c.id,
        c.name,
        c.description,
        c.teacher_id,
        c.created_at
      FROM classes c
      LEFT JOIN class_students cs ON cs.class_id = c.id
      WHERE c.teacher_id = ? OR cs.student_id = ?
      ORDER BY c.created_at DESC`,
      [user.id, user.id],
    );
    return rows.map((row) => toClass(db, row));
  },
});

const toClass = (db: D1DatabaseLike, classroom: ClassRow) => ({
  id: classroom.id,
  name: classroom.name,
  description: classroom.description,
  createdAt: classroom.created_at,
  teacher: async () => toUser(db, await findUser(db, classroom.teacher_id)),
  students: async () => {
    const rows = await all<UserRow>(
      db,
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.created_at
      FROM class_students cs
      JOIN users u ON u.id = cs.student_id
      WHERE cs.class_id = ?
      ORDER BY u.created_at ASC`,
      [classroom.id],
    );
    return rows.map((row) => toUser(db, row));
  },
  exams: async () => {
    const rows = await all<ExamRow>(
      db,
      `SELECT
        id,
        class_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        created_by_id,
        created_at
      FROM exams
      WHERE class_id = ?
      ORDER BY created_at DESC`,
      [classroom.id],
    );
    return rows.map((row) => toExam(db, row));
  },
});

const toQuestionBank = (db: D1DatabaseLike, bank: QuestionBankRow) => ({
  id: bank.id,
  title: bank.title,
  description: bank.description,
  createdAt: bank.created_at,
  owner: async () => toUser(db, await findUser(db, bank.owner_id)),
  questions: async () => {
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
      WHERE bank_id = ?
      ORDER BY created_at DESC`,
      [bank.id],
    );
    return rows.map((row) => toQuestion(db, row));
  },
});

const toQuestion = (db: D1DatabaseLike, question: QuestionRow) => ({
  id: question.id,
  type: question.type,
  title: question.title,
  prompt: question.prompt,
  options: parseJsonArray(question.options_json),
  correctAnswer: question.correct_answer,
  difficulty: question.difficulty,
  tags: parseJsonArray(question.tags_json),
  createdAt: question.created_at,
  bank: async () => toQuestionBank(db, await findQuestionBank(db, question.bank_id)),
  createdBy: async () => toUser(db, await findUser(db, question.created_by_id)),
});

const toExamQuestion = (db: D1DatabaseLike, examQuestion: ExamQuestionRow) => ({
  id: examQuestion.id,
  points: examQuestion.points,
  order: examQuestion.display_order,
  question: async () => toQuestion(db, await findQuestion(db, examQuestion.question_id)),
});

const toAnswer = (db: D1DatabaseLike, answer: AnswerRow) => ({
  id: answer.id,
  value: answer.value,
  autoScore: answer.auto_score,
  manualScore: answer.manual_score,
  feedback: answer.feedback,
  createdAt: answer.created_at,
  question: async () => toQuestion(db, await findQuestion(db, answer.question_id)),
});

const toAttempt = (db: D1DatabaseLike, attempt: AttemptRow) => ({
  id: attempt.id,
  status: attempt.status,
  autoScore: attempt.auto_score,
  manualScore: attempt.manual_score,
  totalScore: attempt.total_score,
  startedAt: attempt.started_at,
  submittedAt: attempt.submitted_at,
  exam: async () => toExam(db, await findExam(db, attempt.exam_id)),
  student: async () => toUser(db, await findUser(db, attempt.student_id)),
  answers: async () => {
    const rows = await all<AnswerRow>(
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
      WHERE attempt_id = ?
      ORDER BY created_at ASC`,
      [attempt.id],
    );
    return rows.map((row) => toAnswer(db, row));
  },
});

const toExam = (db: D1DatabaseLike, exam: ExamRow) => ({
  id: exam.id,
  title: exam.title,
  description: exam.description,
  mode: exam.mode,
  status: exam.status,
  durationMinutes: exam.duration_minutes,
  createdAt: exam.created_at,
  class: async () => toClass(db, await findClass(db, exam.class_id)),
  questions: async () => {
    const rows = await all<ExamQuestionRow>(
      db,
      `SELECT id, exam_id, question_id, points, display_order
       FROM exam_questions
       WHERE exam_id = ?
       ORDER BY display_order ASC`,
      [exam.id],
    );
    return rows.map((row) => toExamQuestion(db, row));
  },
  createdBy: async () => toUser(db, await findUser(db, exam.created_by_id)),
  attempts: async () => {
    const rows = await all<AttemptRow>(
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
      WHERE exam_id = ?
      ORDER BY started_at DESC`,
      [exam.id],
    );
    return rows.map((row) => toAttempt(db, row));
  },
});

export const createRootValue = (db: D1DatabaseLike) => ({
  health: () => ({
    ok: true,
    service: "pinequest-api",
    runtime: "cloudflare-workers-d1",
  }),
  hello: ({ name }: HelloArgs) => ({
    message: `Hello, ${name?.trim() || "world"}!`,
  }),
  me: async () => {
    const actor = await findActor(db);
    return actor ? toUser(db, actor) : null;
  },
  users: async () => {
    const rows = await all<UserRow>(
      db,
      "SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at ASC",
    );
    return rows.map((row) => toUser(db, row));
  },
  classes: async () => {
    const rows = await all<ClassRow>(
      db,
      `SELECT id, name, description, teacher_id, created_at
       FROM classes
       ORDER BY created_at DESC`,
    );
    return rows.map((row) => toClass(db, row));
  },
  class: async ({ id }: ByIdArgs) => {
    const classroom = await first<ClassRow>(
      db,
      "SELECT id, name, description, teacher_id, created_at FROM classes WHERE id = ?",
      [id],
    );
    return classroom ? toClass(db, classroom) : null;
  },
  questionBanks: async () => {
    const rows = await all<QuestionBankRow>(
      db,
      `SELECT id, title, description, owner_id, created_at
       FROM question_banks
       ORDER BY created_at DESC`,
    );
    return rows.map((row) => toQuestionBank(db, row));
  },
  questionBank: async ({ id }: ByIdArgs) => {
    const bank = await first<QuestionBankRow>(
      db,
      `SELECT id, title, description, owner_id, created_at
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
  exams: async () => {
    const rows = await all<ExamRow>(
      db,
      `SELECT
        id,
        class_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        created_by_id,
        created_at
      FROM exams
      ORDER BY created_at DESC`,
    );
    return rows.map((row) => toExam(db, row));
  },
  exam: async ({ id }: ByIdArgs) => {
    const exam = await first<ExamRow>(
      db,
      `SELECT
        id,
        class_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        created_by_id,
        created_at
      FROM exams
      WHERE id = ?`,
      [id],
    );
    return exam ? toExam(db, exam) : null;
  },
  attempts: async () => {
    const rows = await all<AttemptRow>(
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
      ORDER BY started_at DESC`,
    );
    return rows.map((row) => toAttempt(db, row));
  },
  attempt: async ({ id }: ByIdArgs) => {
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
    return attempt ? toAttempt(db, attempt) : null;
  },
  createClass: async ({ name, description }: CreateClassArgs) => {
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const id = makeId("class");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO classes (id, name, description, teacher_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, description ?? null, actor.id, createdAt],
    );

    return toClass(db, await findClass(db, id));
  },
  createQuestionBank: async ({ title, description }: CreateQuestionBankArgs) => {
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const id = makeId("bank");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO question_banks (id, title, description, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, title, description ?? null, actor.id, createdAt],
    );

    return toQuestionBank(db, await findQuestionBank(db, id));
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
    await findQuestionBank(db, bankId);
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const id = makeId("question");
    const createdAt = now();
    const normalizedOptions =
      type === "TRUE_FALSE"
        ? ["True", "False"]
        : type === "MCQ"
          ? options ?? []
          : [];

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

    return toQuestion(db, await findQuestion(db, id));
  },
  createExam: async ({
    classId,
    title,
    description,
    mode,
    durationMinutes,
  }: CreateExamArgs) => {
    await findClass(db, classId);
    const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
    const id = makeId("exam");
    const createdAt = now();

    await run(
      db,
      `INSERT INTO exams (
        id,
        class_id,
        title,
        description,
        mode,
        status,
        duration_minutes,
        created_by_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        classId,
        title,
        description ?? null,
        mode ?? "SCHEDULED",
        "DRAFT",
        durationMinutes,
        actor.id,
        createdAt,
      ],
    );

    return toExam(db, await findExam(db, id));
  },
  addQuestionToExam: async ({ examId, questionId, points }: AddQuestionToExamArgs) => {
    await findExam(db, examId);
    await findQuestion(db, questionId);

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

    return toExam(db, await findExam(db, examId));
  },
  publishExam: async ({ examId }: PublishExamArgs) => {
    await findExam(db, examId);
    await run(db, "UPDATE exams SET status = 'PUBLISHED' WHERE id = ?", [examId]);
    return toExam(db, await findExam(db, examId));
  },
  startAttempt: async ({ examId, studentId }: StartAttemptArgs) => {
    const exam = await findExam(db, examId);
    invariant(exam.status !== "CLOSED", "Cannot start an attempt for a closed exam.");
    await findUser(db, studentId);

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

    return toAttempt(db, await findAttempt(db, id));
  },
  saveAnswer: async ({ attemptId, questionId, value }: SaveAnswerArgs) => {
    const attempt = await findAttempt(db, attemptId);
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
    return toAttempt(db, await findAttempt(db, attemptId));
  },
  submitAttempt: async ({ attemptId }: SubmitAttemptArgs) => {
    await findAttempt(db, attemptId);
    await recalculateAttemptScores(db, attemptId);
    await run(
      db,
      `UPDATE attempts
       SET status = 'SUBMITTED', submitted_at = ?
       WHERE id = ?`,
      [now(), attemptId],
    );
    return toAttempt(db, await findAttempt(db, attemptId));
  },
});
