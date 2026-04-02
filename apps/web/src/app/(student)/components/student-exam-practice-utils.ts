import { Difficulty, QuestionType } from "@/graphql/generated";
import type { StudentExamQuestion } from "./student-exam-room-types";

export const PRACTICE_THRESHOLD = 0.7;

const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.Easy]: 10,
  [Difficulty.Medium]: 20,
  [Difficulty.Hard]: 30,
};

const LEVEL_META = [
  { difficulty: Difficulty.Easy, label: "Level 1 - Easy", title: "Хялбар" },
  { difficulty: Difficulty.Medium, label: "Level 2 - Medium", title: "Дунд" },
  { difficulty: Difficulty.Hard, label: "Level 3 - Hard", title: "Хэцүү" },
] as const;

const GRADABLE_TYPES = new Set([
  QuestionType.Mcq,
  QuestionType.TrueFalse,
  QuestionType.ShortAnswer,
]);

const normalize = (value: string) => value.trim().toLowerCase();

export type PracticeLevel = {
  difficulty: Difficulty;
  label: string;
  questions: StudentExamQuestion[];
  title: string;
};

export const buildPracticeLevels = (questions: StudentExamQuestion[]) =>
  LEVEL_META.map((level) => ({
    ...level,
    questions: questions.filter(
      (question) => question.question.difficulty === level.difficulty,
    ),
  })).filter((level) => level.questions.length > 0);

export const getPracticeAnswerResult = (
  question: StudentExamQuestion,
  value: string,
) => {
  const trimmedValue = value.trim();
  const correctAnswer = question.question.correctAnswer?.trim() ?? "";
  if (!trimmedValue || !correctAnswer || !GRADABLE_TYPES.has(question.question.type)) {
    return null;
  }
  return normalize(trimmedValue) === normalize(correctAnswer);
};

export const buildPracticeProgress = (
  levels: PracticeLevel[],
  getValue: (questionId: string) => string,
) => {
  let streak = 0;
  let xp = 0;
  let correctAnswers = 0;

  const summaries = levels.map((level) => {
    let answered = 0;
    let correct = 0;
    let gradable = 0;

    for (const question of level.questions) {
      const value = getValue(question.question.id);
      const result = getPracticeAnswerResult(question, value);
      if (!value.trim()) continue;
      answered += 1;
      if (result === null) continue;
      gradable += 1;
      if (result) {
        correct += 1;
        correctAnswers += 1;
        streak += 1;
        xp += XP_BY_DIFFICULTY[question.question.difficulty];
        if (streak % 3 === 0) xp += 15;
      } else {
        streak = 0;
      }
    }

    const accuracy = gradable === 0 ? 1 : correct / gradable;
    return {
      ...level,
      accuracy,
      answered,
      complete: answered === level.questions.length,
      correct,
      gradable,
      passed: answered === level.questions.length && accuracy >= PRACTICE_THRESHOLD,
    };
  });

  return { correctAnswers, levelSummaries: summaries, streak, xp };
};

export const getInitialLevelIndex = (
  levels: ReturnType<typeof buildPracticeProgress>["levelSummaries"],
) => {
  const firstOpenIndex = levels.findIndex((level) => !level.complete || !level.passed);
  return firstOpenIndex === -1 ? Math.max(levels.length - 1, 0) : firstOpenIndex;
};

export const getInitialQuestionIndex = (
  level: PracticeLevel,
  getValue: (questionId: string) => string,
) => {
  const nextQuestionIndex = level.questions.findIndex(
    (question) => !getValue(question.question.id).trim(),
  );
  return nextQuestionIndex === -1 ? Math.max(level.questions.length - 1, 0) : nextQuestionIndex;
};
