import { Difficulty, ExamMode } from "@/graphql/generated";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";

const difficultyRank: Record<Difficulty, number> = {
  [Difficulty.Easy]: 0,
  [Difficulty.Medium]: 1,
  [Difficulty.Hard]: 2,
};

const getDifficultyByRank = (rank: number): Difficulty =>
  rank <= 0 ? Difficulty.Easy : rank >= 2 ? Difficulty.Hard : Difficulty.Medium;

const getNextTargetDifficulty = (difficulty: Difficulty, isCorrect: boolean): Difficulty =>
  getDifficultyByRank(difficultyRank[difficulty] + (isCorrect ? 1 : -1));

const pickNextQuestionIndex = (
  remaining: StudentExamData["questions"],
  targetDifficulty: Difficulty,
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

      if (distance < bestDistance) {
        return index;
      }

      if (distance === bestDistance) {
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

  while (remaining.length > 0) {
    const nextIndex = pickNextQuestionIndex(remaining, targetDifficulty);
    const [nextQuestion] = remaining.splice(nextIndex, 1);
    ordered.push(nextQuestion);

    const answer = answersByQuestionId.get(nextQuestion.question.id);
    if (!answer?.value.trim().length) {
      break;
    }

    const earnedScore = (answer.autoScore ?? 0) + (answer.manualScore ?? 0);
    const isCorrect = earnedScore >= nextQuestion.points;
    targetDifficulty = getNextTargetDifficulty(
      nextQuestion.question.difficulty,
      isCorrect,
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
