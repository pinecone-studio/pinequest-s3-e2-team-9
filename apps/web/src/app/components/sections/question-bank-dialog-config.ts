"use client";

import { Difficulty, QuestionType } from "@/graphql/generated";

export const difficultyOptions = [
  { label: "Хялбар түвшин", value: Difficulty.Easy },
  { label: "Дунд түвшин", value: Difficulty.Medium },
  { label: "Хүнд түвшин", value: Difficulty.Hard },
];

export const questionTypeOptions = [
  { label: "Сонгох", value: QuestionType.Mcq },
  { label: "Үнэн / Худал", value: QuestionType.TrueFalse },
  { label: "Тоо бодолт", value: QuestionType.ShortAnswer },
  { label: "Задгай хариулт", value: QuestionType.Essay },
];

export const resetQuestionOptions = () => [
  "Сонголт A",
  "Сонголт B",
  "Сонголт C",
  "Сонголт D",
];
