import { ExamMode } from "@/graphql/generated";
import type {
  CreateExamFieldErrors,
  CreateExamFormValues,
} from "../create-exam-types";

export const INITIAL_FORM_VALUES: CreateExamFormValues = {
  classId: "",
  title: "",
  description: "",
  durationMinutes: "60",
  mode: ExamMode.Scheduled,
  scheduledFor: "",
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
      errors.selectedQuestions ||
      Object.keys(errors.pointsByQuestionId).length,
  );

export const toErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : "Шалгалт үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.";
