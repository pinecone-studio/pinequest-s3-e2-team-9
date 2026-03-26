export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "IMAGE_UPLOAD";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ExamMode = "SCHEDULED" | "OPEN_WINDOW";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";
export type ClassStudentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type ClassRow = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  grade: number;
  teacher_id: string;
  created_at: string;
};

export type QuestionBankRow = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  owner_id: string;
  created_at: string;
};

export type QuestionRow = {
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

export type ExamRow = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  mode: ExamMode;
  status: ExamStatus;
  duration_minutes: number;
  started_at: string | null;
  ends_at: string | null;
  created_by_id: string;
  scheduled_for: string | null;
  created_at: string;
};

export type ExamQuestionRow = {
  id: string;
  exam_id: string;
  question_id: string;
  points: number;
  display_order: number;
};

export type AttemptRow = {
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

export type AnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  value: string;
  auto_score: number | null;
  manual_score: number | null;
  feedback: string | null;
  created_at: string;
};
