"use client";

import { Difficulty, QuestionType } from "@/graphql/generated";
import { formatTolerance, type QuestionBankQuestionRow } from "../question-bank-utils";

export const getQuestionDialogTitle = (type: QuestionType) => {
  if (type === QuestionType.TrueFalse) {
    return "True False";
  }
  if (type === QuestionType.ShortAnswer) {
    return "Numeric";
  }
  if (type === QuestionType.Essay) {
    return "Long answer";
  }
  return "Multiple Choice";
};

export const getQuestionDialogSubmitLabel = (editing: boolean) =>
  editing ? "Хадгалах" : "Асуулт нэмэх";

export const getInitialQuestionState = (
  question?: QuestionBankQuestionRow | null,
): {
  prompt: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options: string[];
  correctIndex: number;
  truthValue: string;
  numericAnswer: string;
  tolerance: string;
  referenceAnswer: string;
} => ({
  prompt: question?.prompt ?? "",
  questionType: (question?.rawType as QuestionType | undefined) ?? QuestionType.Mcq,
  difficulty: (question?.rawDifficulty as Difficulty | undefined) ?? Difficulty.Medium,
  options:
    question?.rawType === "MCQ" && question.options.length
      ? question.options
      : ["Сонголт A", "Сонголт B", "Сонголт C", "Сонголт D"],
  correctIndex:
    question?.rawType === "MCQ"
      ? Math.max(0, question.options.findIndex((item) => item === question.correctAnswer))
      : 0,
  truthValue: question?.correctAnswer === "False" ? "Худал" : "Үнэн",
  numericAnswer: question?.rawType === "SHORT_ANSWER" ? question.correctAnswer ?? "" : "",
  tolerance: question?.rawType === "SHORT_ANSWER" ? formatTolerance(question.tags) ?? "" : "",
  referenceAnswer: question?.rawType === "ESSAY" ? question.correctAnswer ?? "" : "",
});

export const buildCreateQuestionPayload = ({
  prompt,
  questionType,
  options,
  correctIndex,
  truthValue,
  numericAnswer,
  tolerance,
  referenceAnswer,
  difficulty,
}: {
  prompt: string;
  questionType: QuestionType;
  options: string[];
  correctIndex: number;
  truthValue: string;
  numericAnswer: string;
  tolerance: string;
  referenceAnswer: string;
  difficulty: Difficulty;
}) => {
  const trimmedPrompt = prompt.trim();
  const normalizedOptions = questionType === QuestionType.Mcq
    ? options.map((item) => item.trim()).filter(Boolean)
    : questionType === QuestionType.TrueFalse
      ? ["True", "False"]
      : [];
  const correctAnswer = questionType === QuestionType.Mcq
    ? normalizedOptions[correctIndex] ?? normalizedOptions[0]
    : questionType === QuestionType.TrueFalse
      ? truthValue === "Үнэн" ? "True" : "False"
      : questionType === QuestionType.ShortAnswer
        ? numericAnswer.trim()
        : referenceAnswer.trim();
  const tags = questionType === QuestionType.ShortAnswer && tolerance.trim()
    ? [`tolerance:${tolerance.trim()}`]
    : [];

  return {
    title: trimmedPrompt.slice(0, 80),
    prompt: trimmedPrompt,
    options: normalizedOptions,
    correctAnswer,
    difficulty,
    tags,
  };
};
