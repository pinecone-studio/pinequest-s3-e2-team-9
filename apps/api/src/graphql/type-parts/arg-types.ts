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

export type UpdateExamDraftQuestionArgs = {
  questionId: string;
  points: number;
};

export type UpdateExamDraftArgs = {
  examId: string;
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
  questionItems?: UpdateExamDraftQuestionArgs[];
};

export type AssignExamToClassArgs = {
  examId: string;
  classId: string;
};

export type PublishExamArgs = { examId: string };
export type CloseExamArgs = { examId: string };
export type StartAttemptArgs = { examId: string; studentId: string };
export type SaveAnswerArgs = { attemptId: string; questionId: string; value: string };
export type ReviewAnswerArgs = {
  answerId: string;
  manualScore: number;
  feedback?: string;
};
export type SubmitAttemptArgs = { attemptId: string };
export type CreateExamImportJobArgs = {
  fileName: string;
  fileSizeBytes: number;
  extractedText: string;
};
export type ReviewedExamImportQuestionInput = {
  id: string;
  order: number;
  type: QuestionType;
  title: string;
  prompt: string;
  options: string[];
  answers: string[];
  score: number;
  difficulty: Difficulty;
  sourcePage?: number | null;
  confidence: number;
  needsReview: boolean;
};
export type ApproveExamImportJobArgs = {
  id: string;
  classId: string;
  questions: ReviewedExamImportQuestionInput[];
};
export type QuestionsArgs = { bankId?: string };
export type ByIdArgs = { id: string };
