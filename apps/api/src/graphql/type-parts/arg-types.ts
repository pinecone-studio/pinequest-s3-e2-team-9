import type {
  AttemptIntegrityEventType,
  CommunityCommentEntityType,
  CommunityVisibility,
  Difficulty,
  ExamGenerationMode,
  ExamDiagnosticConfig,
  ExamGenerationRule,
  ExamMode,
  PassingCriteriaType,
  QuestionBankVisibility,
  QuestionRepositoryFilter,
  QuestionRepositoryKind,
  QuestionShareScope,
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
  repositoryKind?: QuestionRepositoryKind;
};

export type CreateCommunityArgs = {
  name: string;
  description?: string;
  subject?: string;
  grade?: number;
  visibility?: CommunityVisibility;
};

export type CreateQuestionArgs = {
  bankId?: string;
  grade?: number;
  subject?: string;
  topic?: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: Difficulty;
  repositoryKind?: QuestionRepositoryKind;
  shareScope?: QuestionShareScope;
  requiresAccessRequest?: boolean;
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
  repositoryKind?: QuestionRepositoryKind;
  shareScope?: QuestionShareScope;
  requiresAccessRequest?: boolean;
  tags?: string[];
};

export type DeleteQuestionArgs = {
  id: string;
};

export type JoinCommunityArgs = {
  communityId: string;
};

export type ShareQuestionBankToCommunityArgs = {
  communityId: string;
  bankId: string;
};

export type ShareExamToCommunityArgs = {
  communityId: string;
  examId: string;
};

export type AddCommunityCommentArgs = {
  communityId: string;
  entityType: CommunityCommentEntityType;
  entityId: string;
  body: string;
};

export type RateCommunityItemArgs = {
  communityId: string;
  entityType: CommunityCommentEntityType;
  entityId: string;
  value: number;
};

export type CopyCommunitySharedBankToMyBankArgs = {
  sharedBankId: string;
};

export type RequestQuestionAccessArgs = {
  questionId: string;
};

export type ReviewQuestionAccessRequestArgs = {
  requestId: string;
  approve: boolean;
};

export type ForkQuestionToMyBankArgs = {
  questionId: string;
  targetBankId: string;
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
  diagnosticConfig?: ExamDiagnosticConfig;
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
  diagnosticConfig?: ExamDiagnosticConfig;
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
export type RecordAttemptIntegrityEventArgs = {
  attemptId: string;
  type: AttemptIntegrityEventType;
  details?: string;
};
export type CreateExamImportJobArgs = {
  fileName: string;
  fileSizeBytes: number;
  extractedText: string;
  sourceType: "PDF" | "IMAGE";
  storageKey?: string | null;
  extractionJson?: string | null;
  classifierJson?: string | null;
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
  sourceExcerpt?: string | null;
  sourceBlockId?: string | null;
  sourceBboxJson?: string | null;
  confidence: number;
  needsReview: boolean;
};
export type ApproveExamImportJobArgs = {
  id: string;
  classId: string;
  questions: ReviewedExamImportQuestionInput[];
};
export type ReviewAttemptAnswerInput = {
  answerId: string;
  manualScore?: number | null;
  feedback?: string | null;
};
export type ReviewAttemptArgs = {
  attemptId: string;
  answers: ReviewAttemptAnswerInput[];
};
export type QuestionBanksArgs = { repository?: QuestionRepositoryFilter };
export type QuestionsArgs = { bankId?: string; repository?: QuestionRepositoryFilter };
export type ByIdArgs = { id: string };
export type CommunityExamPreviewArgs = { examId: string; communityId?: string | null };
