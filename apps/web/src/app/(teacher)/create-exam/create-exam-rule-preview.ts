import { Difficulty, ExamMode } from "@/graphql/generated";
import type {
  CreateExamGenerationRule,
  CreateExamQuestionOption,
  CreateExamRulePreviewItem,
  CreateExamRuleSourceOption,
} from "./create-exam-types";

const difficultyLabel = (difficulty: CreateExamGenerationRule["difficulty"]) => {
  if (difficulty === Difficulty.Easy) return "Хялбар";
  if (difficulty === Difficulty.Medium) return "Дунд";
  if (difficulty === Difficulty.Hard) return "Хүнд";
  return "Бүх түвшин";
};

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const stableShuffle = <T,>(items: T[], seed: string, getKey: (item: T) => string) =>
  items
    .map((item, index) => ({
      item,
      index,
      rank: hashString(`${seed}:${getKey(item)}:${index}`),
    }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map(({ item }) => item);

export const buildRulePreview = ({
  mode,
  questionOptions,
  rules,
  sourceOptions,
}: {
  mode: ExamMode;
  questionOptions: CreateExamQuestionOption[];
  rules: CreateExamGenerationRule[];
  sourceOptions: CreateExamRuleSourceOption[];
}): CreateExamRulePreviewItem[] =>
  rules.map((rule, index) => {
    const source = sourceOptions.find((option) => option.id === rule.sourceId);
    const availableQuestions = questionOptions
      .filter((question) => source?.bankIds.includes(question.bankId))
      .filter(
        (question) =>
          mode !== ExamMode.Practice ||
          (question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD"),
      )
      .filter((question) => rule.difficulty === "ALL" || question.difficulty === rule.difficulty)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

    const previewSeed = [
      "preview",
      source?.id ?? "missing",
      rule.difficulty ?? "ALL",
      rule.count,
      rule.points,
      String(index),
    ].join(":");

    return {
      ruleId: rule.id,
      label: source?.label ?? `Rule ${index + 1}`,
      difficultyLabel: difficultyLabel(rule.difficulty),
      count: Number(rule.count) || 0,
      questions: stableShuffle(availableQuestions, previewSeed, (question) => question.id).slice(
        0,
        Number(rule.count) || 0,
      ),
    };
  });
