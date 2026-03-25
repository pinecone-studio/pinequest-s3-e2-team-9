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
  created_by_id: string;
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

export type HelloArgs = {
  name?: string;
};

export type CreateClassArgs = {
  name: string;
  description?: string;
};

export type CreateQuestionBankArgs = {
  title: string;
  description?: string;
};

export type CreateQuestionArgs = {
  bankId: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: Difficulty;
  tags?: string[];
};

export type UpdateQuestionArgs = {
  id: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: Difficulty;
  tags?: string[];
};

export type DeleteQuestionArgs = {
  id: string;
};

export type CreateExamArgs = {
  classId: string;
  title: string;
  description?: string;
  mode?: ExamMode;
  durationMinutes: number;
};

export type AddQuestionToExamArgs = {
  examId: string;
  questionId: string;
  points: number;
};

export type PublishExamArgs = {
  examId: string;
};

export type CloseExamArgs = {
  examId: string;
};

export type StartAttemptArgs = {
  examId: string;
  studentId: string;
};

export type SaveAnswerArgs = {
  attemptId: string;
  questionId: string;
  value: string;
};

export type SubmitAttemptArgs = {
  attemptId: string;
};

export type QuestionsArgs = {
  bankId?: string;
};

export type ByIdArgs = {
  id: string;
};

export const now = () => new Date().toISOString();

export const makeId = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;

export const toJsonArray = (values: string[] | undefined) =>
  JSON.stringify(values ?? []);

export const parseJsonArray = (value: string | null | undefined): string[] => {
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

export const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
