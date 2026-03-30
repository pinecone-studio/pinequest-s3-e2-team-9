import type {
  Difficulty,
  ExamGenerationMode,
  ExamMode,
  PassingCriteriaType,
} from "@/graphql/generated";

export type CreateExamGenerationRule = {
  id: string;
  sourceId: string;
  difficulty: Difficulty | "ALL";
  count: string;
  points: string;
};

export type CreateExamFormValues = {
  classId: string;
  title: string;
  description: string;
  durationMinutes: string;
  mode: ExamMode;
  scheduledFor: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  variantCount: 1 | 2 | 4;
  generationMode: ExamGenerationMode;
  generationRules: CreateExamGenerationRule[];
  passingCriteriaType: PassingCriteriaType;
  passingThreshold: string;
};

export type SelectedQuestionPoints = Record<string, string>;

export type CreateExamFieldErrors = {
  classId?: string;
  title?: string;
  durationMinutes?: string;
  scheduledFor?: string;
  passingThreshold?: string;
  selectedQuestions?: string;
  generationRules?: string;
  pointsByQuestionId: Record<string, string>;
};

export type CreateExamClassOption = {
  id: string;
  name: string;
};

export type CreateExamQuestionOption = {
  id: string;
  title: string;
  prompt: string;
  type: string;
  difficulty: string;
  options: string[];
  correctAnswer?: string | null;
  tags: string[];
  bankId: string;
  bankTitle: string;
  bankSubject: string;
  bankGrade: number;
  bankTopic: string;
};

export type CreateExamQuestionBankOption = {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
};

export type CreateExamRuleSourceOption = {
  id: string;
  label: string;
  grade: number;
  subject: string;
  topicGroup: string;
  bankIds: string[];
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
};

export type CreateExamSubmitState =
  | { status: "idle" }
  | {
      status: "success";
      examId: string;
      title: string;
      questionCount: number;
    }
  | {
      status: "error";
      message: string;
    };
