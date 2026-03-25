import {
  type CreateExamFieldErrors,
  type CreateExamFormValues,
  type SelectedQuestionPoints,
} from "./create-exam-types";

const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 360;
const MIN_TITLE_LENGTH = 3;
const DEFAULT_POINTS = 1;

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
