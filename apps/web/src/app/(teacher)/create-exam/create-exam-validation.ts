import {
  type CreateExamFieldErrors,
  type CreateExamFormValues,
  type SelectedQuestionPoints,
  type CreateExamGenerationRule,
} from "./create-exam-types";
import { ExamGenerationMode, PassingCriteriaType } from "@/graphql/generated";

const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 360;
const MIN_TITLE_LENGTH = 3;
const DEFAULT_POINTS = 1;

const totalFromRules = (rules: CreateExamGenerationRule[]) =>
  rules.reduce((sum, rule) => {
    const count = parsePositiveInteger(rule.count) ?? 0;
    const points = parsePositiveInteger(rule.points) ?? 0;
    return sum + count * points;
  }, 0);

const parsePositiveInteger = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed.length || !/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const parseDurationMinutes = (value: string): number | null => {
  const parsed = parsePositiveInteger(value);

  if (!parsed) {
    return null;
  }

  if (parsed < MIN_DURATION_MINUTES || parsed > MAX_DURATION_MINUTES) {
    return null;
  }

  return parsed;
};

export const toScheduledForIso = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString();
};

export const toSelectedQuestionsPayload = (
  selectedQuestionPoints: SelectedQuestionPoints,
): Array<{ questionId: string; points: number }> =>
  Object.entries(selectedQuestionPoints)
    .map(([questionId, points]) => ({
      questionId,
      points: parsePositiveInteger(points) ?? DEFAULT_POINTS,
    }))
    .filter((item) => item.points > 0);

export const validateCreateExamForm = (
  values: CreateExamFormValues,
  selectedQuestionPoints: SelectedQuestionPoints,
): CreateExamFieldErrors => {
  const errors: CreateExamFieldErrors = {
    pointsByQuestionId: {},
  };

  if (!values.classId.trim()) {
    errors.classId = "Анги сонгоно уу.";
  }

  const title = values.title.trim();
  if (title.length < MIN_TITLE_LENGTH) {
    errors.title = `Шалгалтын нэр хамгийн багадаа ${MIN_TITLE_LENGTH} тэмдэгт байна.`;
  }

  if (!parseDurationMinutes(values.durationMinutes)) {
    errors.durationMinutes =
      `Хугацаа ${MIN_DURATION_MINUTES}-${MAX_DURATION_MINUTES} минутын хооронд байна.`;
  }

  if (values.scheduledFor.trim().length && !toScheduledForIso(values.scheduledFor)) {
    errors.scheduledFor = "Огноо, цагаа зөв форматаар оруулна уу.";
  }

  const passingThreshold = parsePositiveInteger(values.passingThreshold);
  const totalPoints =
    values.generationMode === ExamGenerationMode.RuleBased
      ? totalFromRules(values.generationRules)
      : Object.values(selectedQuestionPoints).reduce((sum, points) => {
          const parsed = parsePositiveInteger(points) ?? DEFAULT_POINTS;
          return sum + parsed;
        }, 0);

  if (!passingThreshold) {
    errors.passingThreshold = "Тэнцэх босго нь 1-ээс их бүхэл тоо байна.";
  } else if (values.passingCriteriaType === PassingCriteriaType.Percentage) {
    if (passingThreshold > 100) {
      errors.passingThreshold = "Хувийн босго 100-аас ихгүй байна.";
    }
  } else if (passingThreshold > Math.max(totalPoints, 1)) {
    errors.passingThreshold = "Тэнцэх оноо нь нийт онооноос их байж болохгүй.";
  }

  if (values.generationMode === ExamGenerationMode.RuleBased) {
    if (!values.generationRules.length) {
      errors.generationRules = "Дор хаяж нэг rule нэмнэ үү.";
      return errors;
    }

    const hasInvalidRule = values.generationRules.some((rule) => {
      const count = parsePositiveInteger(rule.count);
      const points = parsePositiveInteger(rule.points);
      return !rule.sourceId.trim() || !count || !points;
    });

    if (hasInvalidRule) {
      errors.generationRules =
        "Rule бүр дээр сан, асуултын тоо, нэг асуултын оноог зөв оруулна уу.";
    }

    return errors;
  }

  const selectedEntries = Object.entries(selectedQuestionPoints);
  if (!selectedEntries.length) {
    errors.selectedQuestions = "Дор хаяж нэг асуулт сонгоно уу.";
    return errors;
  }

  selectedEntries.forEach(([questionId, points]) => {
    if (!parsePositiveInteger(points)) {
      errors.pointsByQuestionId[questionId] =
        "Оноо нь 1-ээс их бүхэл тоо байх ёстой.";
    }
  });

  return errors;
};
