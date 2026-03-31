import { ExamGenerationMode, type EditExamDraftQuery, type QuestionType } from "@/graphql/generated";
import type {
  CreateExamFormValues,
  CreateExamRuleSourceOption,
  SelectedQuestionPoints,
} from "../create-exam-types";

type DraftExam = NonNullable<EditExamDraftQuery["exam"]>;

const matchesBankIds = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id, index) => id === right[index]);

export const toDraftScheduledInput = (scheduledFor?: string | null) => scheduledFor ?? "";

export const toDraftSelectedQuestionPoints = (exam: DraftExam): SelectedQuestionPoints =>
  Object.fromEntries(exam.questions.map((item) => [item.question.id, String(item.points)]));

export const toDraftInitialBankId = (
  exam: DraftExam,
  fallbackBankId: string,
) => {
  if (fallbackBankId) {
    return fallbackBankId;
  }

  const bankIds = [...new Set(exam.questions.map((item) => item.question.bank.id))];
  return bankIds.length === 1 ? bankIds[0] : "";
};

export const toDraftFormValues = (
  exam: DraftExam,
  ruleSourceOptions: CreateExamRuleSourceOption[],
): CreateExamFormValues => ({
  classId: exam.class.id,
  title: exam.title,
  description: exam.description ?? "",
  durationMinutes: String(exam.durationMinutes),
  mode: exam.mode,
  scheduledFor: toDraftScheduledInput(exam.scheduledFor),
  shuffleQuestions: exam.shuffleQuestions,
  shuffleAnswers: exam.shuffleAnswers,
  variantCount: 1,
  generationMode: exam.generationMode,
  generationRules:
    exam.generationMode === ExamGenerationMode.RuleBased
      ? exam.generationRules.map((rule, index) => {
          const source = ruleSourceOptions.find((option) => matchesBankIds(option.bankIds, rule.bankIds));
          return {
            id: `draft_rule_${index + 1}`,
            sourceId: source?.id ?? "",
            difficulty: rule.difficulty ?? "ALL",
            count: String(rule.count),
            points: String(rule.points),
          };
        })
      : [],
  passingCriteriaType: exam.passingCriteriaType,
  passingThreshold: String(exam.passingThreshold),
});

export const supportsQuestionShuffle = (type: QuestionType) => type !== "ESSAY" && type !== "IMAGE_UPLOAD";
