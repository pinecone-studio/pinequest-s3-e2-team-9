import type {
  Difficulty,
  ExamGenerationMode,
  ExamGenerationRule,
  ExamMode,
  PassingCriteriaType,
  QuestionBankVisibility,
  QuestionType,
} from "./model-types";

export type HelloArgs = { name?: string };
export type CreateClassArgs = { name: string; description?: string };
export type CreateQuestionBankArgs = {
  title: string;
  description?: string;
  grade?: number;
  subject?: string;
  topic?: string;
  visibility?: QuestionBankVisibility;
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

export type CreateQuestionVariantsArgs = {
  sourceQuestionId: string;
  totalVariants: number;
};

export type CreateExamDraftVariantsArgs = {
  sourceQuestionId: string;
  totalVariants: number;
};

export type GroupQuestionsAsVariantsArgs = {
  questionIds: string[];
};

export type CreateExamArgs = {
  classId: string;
  title: string;
  description?: string;
  mode?: ExamMode;
  durationMinutes: number;
  scheduledFor?: string;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  generationMode?: ExamGenerationMode;
  rules?: ExamGenerationRule[];
  passingCriteriaType?: PassingCriteriaType;
  passingThreshold?: number;
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
