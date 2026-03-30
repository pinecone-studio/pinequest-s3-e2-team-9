import {
  ExamGenerationMode,
  ExamMode,
  PassingCriteriaType,
} from "@/graphql/generated";
import type {
  CreateExamFieldErrors,
  CreateExamGenerationRule,
  CreateExamFormValues,
} from "../create-exam-types";

const createRuleId = () =>
  `rule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const createEmptyGenerationRule = (bankId = ""): CreateExamGenerationRule => ({
  id: createRuleId(),
  sourceId: bankId,
  difficulty: "ALL",
  count: "5",
  points: "1",
});

export const INITIAL_FORM_VALUES: CreateExamFormValues = {
  classId: "",
  title: "",
  description: "",
  durationMinutes: "60",
  mode: ExamMode.Scheduled,
  scheduledFor: "",
  shuffleQuestions: false,
  shuffleAnswers: false,
  variantCount: 1,
  generationMode: ExamGenerationMode.Manual,
  generationRules: [],
  passingCriteriaType: PassingCriteriaType.Percentage,
  passingThreshold: "40",
};

export const EMPTY_ERRORS: CreateExamFieldErrors = {
  pointsByQuestionId: {},
};

export const hasValidationErrors = (errors: CreateExamFieldErrors): boolean =>
  Boolean(
    errors.classId ||
      errors.title ||
      errors.durationMinutes ||
      errors.scheduledFor ||
      errors.passingThreshold ||
      errors.selectedQuestions ||
      errors.generationRules ||
      Object.keys(errors.pointsByQuestionId).length,
  );

export const toErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : "Шалгалт үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.";
