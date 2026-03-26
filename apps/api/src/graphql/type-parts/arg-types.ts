import type {
  Difficulty,
  ExamMode,
  QuestionType,
} from "./model-types";

export type HelloArgs = { name?: string };
export type CreateClassArgs = { name: string; description?: string };
export type CreateQuestionBankArgs = { title: string; description?: string };

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
  scheduledFor?: string;
};

export type AddQuestionToExamArgs = {
  examId: string;
  questionId: string;
  points: number;
};

export type AssignExamToClassArgs = {
  examId: string;
  classId: string;
};

export type PublishExamArgs = { examId: string };
export type CloseExamArgs = { examId: string };
export type StartAttemptArgs = { examId: string; studentId: string };
export type SaveAnswerArgs = { attemptId: string; questionId: string; value: string };
export type SubmitAttemptArgs = { attemptId: string };
export type QuestionsArgs = { bankId?: string };
export type ByIdArgs = { id: string };
