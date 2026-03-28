import type { ExamMode, PassingCriteriaType } from "@/graphql/generated";

export type CreateExamFormValues = {
  classId: string;
  title: string;
  description: string;
  durationMinutes: string;
  mode: ExamMode;
  scheduledFor: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
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
