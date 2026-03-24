export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ExamMode = "SCHEDULED" | "OPEN_WINDOW";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

export type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type ClassRecord = {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  createdAt: string;
};

export type EnrollmentRecord = {
  id: string;
  classId: string;
  studentId: string;
};

export type QuestionBankRecord = {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: string;
};

export type QuestionRecord = {
  id: string;
  bankId: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options: string[];
  correctAnswer?: string;
  difficulty: Difficulty;
  tags: string[];
  createdById: string;
  createdAt: string;
};

export type ExamRecord = {
  id: string;
  classId: string;
  title: string;
  description?: string;
  mode: ExamMode;
  status: ExamStatus;
  durationMinutes: number;
  createdById: string;
  createdAt: string;
};

export type ExamQuestionRecord = {
  id: string;
  examId: string;
  questionId: string;
  points: number;
  order: number;
};

export type AttemptRecord = {
  id: string;
  examId: string;
  studentId: string;
  status: AttemptStatus;
  autoScore: number;
  manualScore: number;
  totalScore: number;
  startedAt: string;
  submittedAt?: string;
};

export type AnswerRecord = {
  id: string;
  attemptId: string;
  questionId: string;
  value: string;
  autoScore?: number;
  manualScore?: number;
  feedback?: string;
  createdAt: string;
};

export type MockState = {
  users: UserRecord[];
  classes: ClassRecord[];
  enrollments: EnrollmentRecord[];
  questionBanks: QuestionBankRecord[];
  questions: QuestionRecord[];
  exams: ExamRecord[];
  examQuestions: ExamQuestionRecord[];
  attempts: AttemptRecord[];
  answers: AnswerRecord[];
};

const now = () => new Date().toISOString();

const counters: Record<string, number> = {};

export const makeId = (prefix: string): string => {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}_${String(counters[prefix]).padStart(3, "0")}`;
};

const teacherId = "user_teacher_001";
const studentId = "user_student_001";
const studentTwoId = "user_student_002";
const classId = "class_001";
const bankId = "bank_001";
const questionOneId = "question_001";
const questionTwoId = "question_002";
const examId = "exam_001";

export const state: MockState = {
  users: [
    {
      id: teacherId,
      fullName: "Anu Teacher",
      email: "anu.teacher@pinequest.dev",
      role: "TEACHER",
      createdAt: now(),
    },
    {
      id: studentId,
      fullName: "Temuulen Student",
      email: "temuulen.student@pinequest.dev",
      role: "STUDENT",
      createdAt: now(),
    },
    {
      id: studentTwoId,
      fullName: "Nomin Student",
      email: "nomin.student@pinequest.dev",
      role: "STUDENT",
      createdAt: now(),
    },
  ],
  classes: [
    {
      id: classId,
      name: "10A Physics",
      description: "Assessment pilot class",
      teacherId,
      createdAt: now(),
    },
  ],
  enrollments: [
    {
      id: "enrollment_001",
      classId,
      studentId,
    },
    {
      id: "enrollment_002",
      classId,
      studentId: studentTwoId,
    },
  ],
  questionBanks: [
    {
      id: bankId,
      title: "Physics Midterm Bank",
      description: "Core mechanics and waves questions",
      ownerId: teacherId,
      createdAt: now(),
    },
  ],
  questions: [
    {
      id: questionOneId,
      bankId,
      type: "MCQ",
      title: "SI unit of force",
      prompt: "Force-ийн SI нэгжийг сонгоно уу.",
      options: ["Joule", "Newton", "Pascal", "Watt"],
      correctAnswer: "Newton",
      difficulty: "EASY",
      tags: ["physics", "units"],
      createdById: teacherId,
      createdAt: now(),
    },
    {
      id: questionTwoId,
      bankId,
      type: "SHORT_ANSWER",
      title: "State Newton's second law",
      prompt: "Newton-ы 2-р хуулийг товч бичнэ үү.",
      options: [],
      correctAnswer: "Force equals mass times acceleration",
      difficulty: "MEDIUM",
      tags: ["physics", "laws"],
      createdById: teacherId,
      createdAt: now(),
    },
  ],
  exams: [
    {
      id: examId,
      classId,
      title: "Physics Midterm Demo",
      description: "Scheduled assessment demo",
      mode: "SCHEDULED",
      status: "DRAFT",
      durationMinutes: 45,
      createdById: teacherId,
      createdAt: now(),
    },
  ],
  examQuestions: [
    {
      id: "exam_question_001",
      examId,
      questionId: questionOneId,
      points: 5,
      order: 1,
    },
    {
      id: "exam_question_002",
      examId,
      questionId: questionTwoId,
      points: 10,
      order: 2,
    },
  ],
  attempts: [],
  answers: [],
};

export const currentUserId = teacherId;
