import { Difficulty, ExamMode } from "@/graphql/generated";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";
import {
  getAdaptiveTargetDifficulty,
  getPreferredWeakTopic,
} from "./student-exam-practice-mastery";

const difficultyRank: Record<Difficulty, number> = {
  [Difficulty.Easy]: 0,
  [Difficulty.Medium]: 1,
  [Difficulty.Hard]: 2,
};

const pickNextQuestionIndex = (
  remaining: StudentExamData["questions"],
  targetDifficulty: Difficulty,
  preferredTopic: string | null,
) => {
  const targetRank = difficultyRank[targetDifficulty];

  return remaining.reduce(
    (bestIndex, item, index, items) => {
      if (bestIndex === -1) {
        return index;
      }

      const best = items[bestIndex];
      const distance =
        Math.abs(difficultyRank[item.question.difficulty] - targetRank);
      const bestDistance =
        Math.abs(difficultyRank[best.question.difficulty] - targetRank);
      const topicPenalty =
        preferredTopic && (item.question.bank?.topic ?? "Ерөнхий") !== preferredTopic ? 2 : 0;
      const bestTopicPenalty =
        preferredTopic && (best.question.bank?.topic ?? "Ерөнхий") !== preferredTopic ? 2 : 0;
      const score = distance * 10 + topicPenalty;
      const bestScore = bestDistance * 10 + bestTopicPenalty;

      if (score < bestScore) {
        return index;
      }

      if (score === bestScore) {
        return item.order < best.order ? index : bestIndex;
      }

      return bestIndex;
    },
    -1,
  );
};

export const applyAdaptivePracticeOrdering = (
  exam: StudentExamData,
  attempt: StudentExamAttempt | null,
) => {
  if (exam.mode !== ExamMode.Practice) {
    return exam;
  }

  const answersByQuestionId = new Map(
    attempt?.answers.map((answer) => [answer.question.id, answer]) ?? [],
  );
  const ordered: StudentExamData["questions"] = [];
  const remaining = [...exam.questions];
  let targetDifficulty = Difficulty.Medium;
  let adaptiveStreak = 0;

  while (remaining.length > 0) {
    const remainingQuestionIds = new Set(remaining.map((item) => item.question.id));
    const preferredTopic = getPreferredWeakTopic(exam, attempt, remainingQuestionIds);
    const nextIndex = pickNextQuestionIndex(
      remaining,
      targetDifficulty,
      preferredTopic,
    );
    const [nextQuestion] = remaining.splice(nextIndex, 1);
    ordered.push(nextQuestion);

    const answer = answersByQuestionId.get(nextQuestion.question.id);
    if (!answer?.value.trim().length) {
      break;
    }

    const earnedScore = (answer.autoScore ?? 0) + (answer.manualScore ?? 0);
    const isCorrect = earnedScore >= nextQuestion.points;
    adaptiveStreak = isCorrect
      ? Math.max(1, adaptiveStreak + 1)
      : Math.min(-1, adaptiveStreak - 1);
    targetDifficulty = getAdaptiveTargetDifficulty(
      nextQuestion.question.difficulty,
      isCorrect,
      Math.abs(adaptiveStreak),
    );
  }

  if (remaining.length === 0) {
    return { ...exam, questions: ordered };
  }

  const rest = [...remaining].sort((left, right) => {
    const leftDistance =
      Math.abs(difficultyRank[left.question.difficulty] - difficultyRank[targetDifficulty]);
    const rightDistance =
      Math.abs(difficultyRank[right.question.difficulty] - difficultyRank[targetDifficulty]);

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.order - right.order;
  });

  return {
    ...exam,
    questions: [...ordered, ...rest],
  };
};
