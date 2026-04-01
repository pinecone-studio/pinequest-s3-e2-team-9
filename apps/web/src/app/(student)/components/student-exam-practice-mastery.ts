/* eslint-disable max-lines */
import { Difficulty } from "@/graphql/generated";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";

const difficultyRank: Record<Difficulty, number> = {
  [Difficulty.Easy]: 0,
  [Difficulty.Medium]: 1,
  [Difficulty.Hard]: 2,
};

const difficultyWeight: Record<Difficulty, number> = {
  [Difficulty.Easy]: 1,
  [Difficulty.Medium]: 1.6,
  [Difficulty.Hard]: 2.2,
};

const difficultyLabel: Record<Difficulty, string> = {
  [Difficulty.Easy]: "Хялбар",
  [Difficulty.Medium]: "Дунд",
  [Difficulty.Hard]: "Хүнд",
};

type TopicMetric = {
  topic: string;
  attempted: number;
  weightedEarned: number;
  weightedPossible: number;
};

type DifficultyMetric = {
  weightedEarned: number;
  weightedPossible: number;
};

type PracticeMasteryTopic = {
  topic: string;
  attempted: number;
  masteryPercent: number;
};

export type PracticeMasterySummary = {
  answeredCount: number;
  overallMasteryPercent: number;
  estimatedLevel: "Суурь" | "Дунд" | "Ахисан";
  confidenceLabel: "Бага" | "Дунд" | "Өндөр";
  recommendedDifficulty: string;
  weakTopics: PracticeMasteryTopic[];
  strongTopics: PracticeMasteryTopic[];
};

const clampRatio = (value: number) => {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
};

const toMasteryPercent = (earned: number, possible: number) =>
  possible > 0 ? Math.round((earned / possible) * 100) : 0;

const getConfidenceLabel = (answeredCount: number): PracticeMasterySummary["confidenceLabel"] => {
  if (answeredCount >= 10) return "Өндөр";
  if (answeredCount >= 5) return "Дунд";
  return "Бага";
};

const getEstimatedLevel = (
  overallMasteryPercent: number,
  difficultyMetrics: Record<Difficulty, DifficultyMetric>,
): PracticeMasterySummary["estimatedLevel"] => {
  const mediumMastery = toMasteryPercent(
    difficultyMetrics[Difficulty.Medium].weightedEarned,
    difficultyMetrics[Difficulty.Medium].weightedPossible,
  );
  const hardMastery = toMasteryPercent(
    difficultyMetrics[Difficulty.Hard].weightedEarned,
    difficultyMetrics[Difficulty.Hard].weightedPossible,
  );

  if (overallMasteryPercent >= 78 && hardMastery >= 60) {
    return "Ахисан";
  }

  if (overallMasteryPercent >= 58 && mediumMastery >= 55) {
    return "Дунд";
  }

  return "Суурь";
};

const getRecommendedDifficulty = (
  overallMasteryPercent: number,
  estimatedLevel: PracticeMasterySummary["estimatedLevel"],
) => {
  if (estimatedLevel === "Ахисан" || overallMasteryPercent >= 80) {
    return difficultyLabel[Difficulty.Hard];
  }

  if (estimatedLevel === "Дунд" || overallMasteryPercent >= 55) {
    return difficultyLabel[Difficulty.Medium];
  }

  return difficultyLabel[Difficulty.Easy];
};

export const buildPracticeMasterySummary = (
  exam: StudentExamData,
  attempt: StudentExamAttempt,
): PracticeMasterySummary => {
  const answersByQuestionId = new Map(
    attempt.answers.map((answer) => [answer.question.id, answer]),
  );
  const topicMetrics = new Map<string, TopicMetric>();
  const difficultyMetrics: Record<Difficulty, DifficultyMetric> = {
    [Difficulty.Easy]: { weightedEarned: 0, weightedPossible: 0 },
    [Difficulty.Medium]: { weightedEarned: 0, weightedPossible: 0 },
    [Difficulty.Hard]: { weightedEarned: 0, weightedPossible: 0 },
  };

  let weightedEarned = 0;
  let weightedPossible = 0;
  let answeredCount = 0;

  for (const item of exam.questions) {
    const answer = answersByQuestionId.get(item.question.id);
    if (!answer?.value.trim()) {
      continue;
    }

    answeredCount += 1;
    const difficulty = item.question.difficulty;
    const weight = difficultyWeight[difficulty];
    const ratio = clampRatio(
      ((answer.autoScore ?? 0) + (answer.manualScore ?? 0)) / Math.max(item.points, 1),
    );
    const topic = answer.question.bank?.topic ?? item.question.bank?.topic ?? "Ерөнхий";

    weightedEarned += weight * ratio;
    weightedPossible += weight;

    difficultyMetrics[difficulty].weightedEarned += weight * ratio;
    difficultyMetrics[difficulty].weightedPossible += weight;

    const currentTopic =
      topicMetrics.get(topic) ?? {
        topic,
        attempted: 0,
        weightedEarned: 0,
        weightedPossible: 0,
      };
    currentTopic.attempted += 1;
    currentTopic.weightedEarned += weight * ratio;
    currentTopic.weightedPossible += weight;
    topicMetrics.set(topic, currentTopic);
  }

  const overallMasteryPercent = toMasteryPercent(weightedEarned, weightedPossible);
  const estimatedLevel = getEstimatedLevel(overallMasteryPercent, difficultyMetrics);
  const topics = [...topicMetrics.values()]
    .map((topic) => ({
      topic: topic.topic,
      attempted: topic.attempted,
      masteryPercent: toMasteryPercent(topic.weightedEarned, topic.weightedPossible),
    }))
    .sort((left, right) => {
      if (left.masteryPercent !== right.masteryPercent) {
        return left.masteryPercent - right.masteryPercent;
      }
      return right.attempted - left.attempted;
    });

  return {
    answeredCount,
    overallMasteryPercent,
    estimatedLevel,
    confidenceLabel: getConfidenceLabel(answeredCount),
    recommendedDifficulty: getRecommendedDifficulty(overallMasteryPercent, estimatedLevel),
    weakTopics: topics.filter((topic) => topic.attempted > 0).slice(0, 3),
    strongTopics: [...topics]
      .reverse()
      .filter((topic) => topic.attempted > 0)
      .slice(0, 2),
  };
};

export const getAdaptiveTargetDifficulty = (
  currentDifficulty: Difficulty,
  isCorrect: boolean,
  streak: number,
) => {
  const step = streak >= 2 ? 2 : 1;
  const nextRank = Math.max(
    0,
    Math.min(
      2,
      difficultyRank[currentDifficulty] + (isCorrect ? step : -step),
    ),
  );

  return nextRank <= 0
    ? Difficulty.Easy
    : nextRank >= 2
      ? Difficulty.Hard
      : Difficulty.Medium;
};

export const getPreferredWeakTopic = (
  exam: StudentExamData,
  attempt: StudentExamAttempt | null,
  remainingQuestionIds: Set<string>,
) => {
  if (!attempt) {
    return null;
  }

  const weakTopicCounts = new Map<string, number>();
  for (const answer of attempt.answers) {
    if (!answer.value.trim()) {
      continue;
    }

    const topic = answer.question.bank?.topic ?? "Ерөнхий";
    const relatedRemainingCount = exam.questions.filter(
      (item) =>
        remainingQuestionIds.has(item.question.id) &&
        (item.question.bank?.topic ?? "Ерөнхий") === topic,
    ).length;

    if (!relatedRemainingCount) {
      continue;
    }

    const isWrong = (answer.autoScore ?? 0) + (answer.manualScore ?? 0) < 1;
    weakTopicCounts.set(topic, (weakTopicCounts.get(topic) ?? 0) + (isWrong ? 2 : 1));
  }

  const sorted = [...weakTopicCounts.entries()].sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] ?? null;
};
