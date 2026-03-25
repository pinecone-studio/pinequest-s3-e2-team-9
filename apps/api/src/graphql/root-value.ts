import { all, first, invariant, run, type D1DatabaseLike } from "../lib/d1";
import {
  createAttemptMutations,
  findAttemptById,
} from "./modules/attempts";
import {
  createExamQueriesAndMutations,
  findExamById,
} from "./modules/exams";
import {
  createQuestionQueriesAndMutations,
  findQuestionBankById,
  findQuestionById,
} from "./modules/questions";
import {
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type AddQuestionToExamArgs,
  type AnswerRow,
  type AttemptRow,
  type ByIdArgs,
  type ClassRow,
  type CreateClassArgs,
  type ExamQuestionRow,
  type ExamRow,
  type HelloArgs,
  type QuestionBankRow,
  type QuestionRow,
  type Role,
  type UserRow,
} from "./types";

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

const findActor = async (db: D1DatabaseLike): Promise<UserRow | null> =>
  first<UserRow>(
    db,
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY CASE role
       WHEN 'TEACHER' THEN 0
       WHEN 'ADMIN' THEN 1
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
     ORDER BY CASE role
       WHEN 'TEACHER' THEN 0
       WHEN 'ADMIN' THEN 1
       ELSE 2
     END, created_at ASC
     LIMIT 1`,
    roles,
  );
  invariant(
    actor,
    `No ${roles.join("/")} user found. Seed the users table before running this mutation.`,
  );
  return actor;
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
  subject: bank.subject,
  createdAt: bank.created_at,
  questionCount: async () => {
    const aggregate = await first<{ count: number | null }>(
      db,
      "SELECT COUNT(*) AS count FROM questions WHERE bank_id = ?",
      [bank.id],
    );
    return aggregate?.count ?? 0;
  },
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
  bank: async () => toQuestionBank(db, await findQuestionBankById(db, question.bank_id)),
  createdBy: async () => toUser(db, await findUser(db, question.created_by_id)),
});

const toExamQuestion = (db: D1DatabaseLike, examQuestion: ExamQuestionRow) => ({
  id: examQuestion.id,
  points: examQuestion.points,
  order: examQuestion.display_order,
  question: async () => toQuestion(db, await findQuestionById(db, examQuestion.question_id)),
});

const toAnswer = (db: D1DatabaseLike, answer: AnswerRow) => ({
  id: answer.id,
  value: answer.value,
  autoScore: answer.auto_score,
  manualScore: answer.manual_score,
  feedback: answer.feedback,
  createdAt: answer.created_at,
  question: async () => toQuestion(db, await findQuestionById(db, answer.question_id)),
});

const toAttempt = (db: D1DatabaseLike, attempt: AttemptRow) => ({
  id: attempt.id,
  status: attempt.status,
  autoScore: attempt.auto_score,
  manualScore: attempt.manual_score,
  totalScore: attempt.total_score,
  startedAt: attempt.started_at,
  submittedAt: attempt.submitted_at,
  exam: async () => toExam(db, await findExamById(db, attempt.exam_id)),
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
  ...createAttemptMutations({
    db,
    findExam: findExamById,
    findUser,
    findQuestion: findQuestionById,
    toAttempt,
  }),
  ...createExamQueriesAndMutations({
    db,
    requireActor,
    findClass,
    findQuestion: findQuestionById,
    toExam,
  }),
  ...createQuestionQueriesAndMutations({
    db,
    requireActor,
    toQuestionBank,
    toQuestion,
  }),
});
