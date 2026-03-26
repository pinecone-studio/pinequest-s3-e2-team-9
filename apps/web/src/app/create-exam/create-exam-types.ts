import type { ExamMode } from "@/graphql/generated";

export type CreateExamFormValues = {
  classId: string;
  title: string;
  description: string;
  durationMinutes: string;
  mode: ExamMode;
};

export type SelectedQuestionPoints = Record<string, string>;

export type CreateExamFieldErrors = {
  classId?: string;
  title?: string;
  durationMinutes?: string;
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
  bankTitle: string;
  bankSubject: string;
};

export type CreateExamQuestionBankOption = {
  id: string;
  title: string;
  subject: string;
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
