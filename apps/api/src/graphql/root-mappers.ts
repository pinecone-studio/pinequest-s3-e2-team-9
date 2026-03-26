import { all, first, type D1DatabaseLike } from "../lib/d1";
import { getClassSelectFields } from "./class-schema";
import { createClassAnalytics } from "./modules/classes";
import { closeExpiredExams } from "./modules/exams";
import type { AnswerRow, AttemptRow, ClassRow, ExamQuestionRow, ExamRow, QuestionBankRow, QuestionRow, UserRow } from "./types";
import { parseJsonArray } from "./types";

type MapperDependencies = {
  db: D1DatabaseLike;
  findClass: (db: D1DatabaseLike, id: string) => Promise<ClassRow>;
  findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>;
  findQuestion: (db: D1DatabaseLike, id: string) => Promise<QuestionRow>;
  findQuestionBank: (db: D1DatabaseLike, id: string) => Promise<QuestionBankRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
};

export const createEntityMappers = ({
  db, findClass, findExam, findQuestion, findQuestionBank, findUser,
}: MapperDependencies) => {
  const toUser = (user: UserRow) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    classes: async () => {
      const classSelectFields = await getClassSelectFields(db, "c.");
      return (
        await all<ClassRow>(
          db,
          `SELECT DISTINCT ${classSelectFields}
           FROM classes c
           LEFT JOIN class_students cs ON cs.class_id = c.id
           WHERE c.teacher_id = ? OR cs.student_id = ?
           ORDER BY c.created_at DESC`,
          [user.id, user.id],
        )
      ).map(toClass);
    },
  });

  const toClass = (classroom: ClassRow) => ({
    id: classroom.id,
    name: classroom.name,
    description: classroom.description,
    createdAt: classroom.created_at,
    teacher: async () => toUser(await findUser(db, classroom.teacher_id)),
    students: async () =>
      (
        await all<UserRow>(
          db,
          `SELECT u.id, u.full_name, u.email, u.role, u.created_at
           FROM class_students cs JOIN users u ON u.id = cs.student_id
           WHERE cs.class_id = ? ORDER BY u.created_at ASC`,
          [classroom.id],
        )
      ).map(toUser),
    exams: async () =>
      (
        await closeExpiredExams(db),
        await all<ExamRow>(
          db,
          `SELECT id, class_id, title, description, mode, status, duration_minutes, started_at, ends_at, created_by_id, scheduled_for, created_at
           FROM exams WHERE class_id = ? ORDER BY created_at DESC`,
          [classroom.id],
        )
      ).map(toExam),
    ...createClassAnalytics({ db, classroom, findExam, findUser, toExam: (_, exam) => toExam(exam), toUser: (_, user) => toUser(user) }),
  });

  const toQuestionBank = (bank: QuestionBankRow) => ({
    id: bank.id,
    title: bank.title,
    description: bank.description,
    subject: bank.subject,
    createdAt: bank.created_at,
    questionCount: async () => (await first<{ count: number | null }>(db, "SELECT COUNT(*) AS count FROM questions WHERE bank_id = ?", [bank.id]))?.count ?? 0,
    owner: async () => toUser(await findUser(db, bank.owner_id)),
    questions: async () =>
      (
        await all<QuestionRow>(
          db,
          `SELECT id, bank_id, type, title, prompt, options_json, correct_answer, difficulty, tags_json, created_by_id, created_at
           FROM questions WHERE bank_id = ? ORDER BY created_at DESC`,
          [bank.id],
        )
      ).map(toQuestion),
  });

  const toQuestion = (question: QuestionRow) => ({
    id: question.id,
    type: question.type,
    title: question.title,
    prompt: question.prompt,
    options: parseJsonArray(question.options_json),
    correctAnswer: question.correct_answer,
    difficulty: question.difficulty,
    tags: parseJsonArray(question.tags_json),
    createdAt: question.created_at,
    bank: async () => toQuestionBank(await findQuestionBank(db, question.bank_id)),
    createdBy: async () => toUser(await findUser(db, question.created_by_id)),
  });

  const toExamQuestion = (examQuestion: ExamQuestionRow) => ({
    id: examQuestion.id,
    points: examQuestion.points,
    order: examQuestion.display_order,
    question: async () => toQuestion(await findQuestion(db, examQuestion.question_id)),
  });

  const toAnswer = (answer: AnswerRow) => ({
    id: answer.id,
    value: answer.value,
    autoScore: answer.auto_score,
    manualScore: answer.manual_score,
    feedback: answer.feedback,
    createdAt: answer.created_at,
    question: async () => toQuestion(await findQuestion(db, answer.question_id)),
  });

  const toAttempt = (attempt: AttemptRow) => ({
    id: attempt.id,
    status: attempt.status,
    autoScore: attempt.auto_score,
    manualScore: attempt.manual_score,
    totalScore: attempt.total_score,
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
    exam: async () => toExam(await findExam(db, attempt.exam_id)),
    student: async () => toUser(await findUser(db, attempt.student_id)),
    answers: async () =>
      (
        await all<AnswerRow>(
          db,
          `SELECT id, attempt_id, question_id, value, auto_score, manual_score, feedback, created_at
           FROM answers WHERE attempt_id = ? ORDER BY created_at ASC`,
          [attempt.id],
        )
      ).map(toAnswer),
  });

  const toExam = (exam: ExamRow) => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    mode: exam.mode,
    status: exam.status,
    durationMinutes: exam.duration_minutes,
    startedAt: exam.started_at,
    endsAt: exam.ends_at,
    scheduledFor: exam.scheduled_for,
    createdAt: exam.created_at,
    class: async () => toClass(await findClass(db, exam.class_id)),
    questions: async () =>
      (
        await all<ExamQuestionRow>(
          db,
          `SELECT id, exam_id, question_id, points, display_order
           FROM exam_questions WHERE exam_id = ? ORDER BY display_order ASC`,
          [exam.id],
        )
      ).map(toExamQuestion),
    createdBy: async () => toUser(await findUser(db, exam.created_by_id)),
    attempts: async () =>
      (
        await all<AttemptRow>(
          db,
          `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, started_at, submitted_at
           FROM attempts WHERE exam_id = ? ORDER BY started_at DESC`,
          [exam.id],
        )
      ).map(toAttempt),
  });

  return { toAnswer, toAttempt, toClass, toExam, toExamQuestion, toQuestion, toQuestionBank, toUser };
};
