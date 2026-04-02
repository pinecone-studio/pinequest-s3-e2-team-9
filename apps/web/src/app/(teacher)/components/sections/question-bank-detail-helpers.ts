import type { MyExamsQueryQuery } from "@/graphql/generated";
import {
  buildQuestionBankRows,
  type QuestionBankQuestionRow,
  type QuestionUsageStats,
} from "../question-bank-utils";
import type { QuestionBankRelatedExamRow } from "./question-bank-related-exams";

type BankQuestion = {
  id: string;
  title: string;
  prompt: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "IMAGE_UPLOAD";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  shareScope: "PRIVATE" | "COMMUNITY" | "PUBLIC";
  requiresAccessRequest: boolean;
  options: string[];
  correctAnswer?: string | null;
  tags: string[];
  createdBy: {
    id: string;
    fullName: string;
  };
};

type ExamsData = MyExamsQueryQuery["exams"] | undefined;

export const getQuestionUsageStats = (
  questions: BankQuestion[] | undefined,
  exams: ExamsData,
): QuestionUsageStats => {
  const stats: QuestionUsageStats = {};
  const bankQuestionIds = new Set(questions?.map((question) => question.id) ?? []);

  if (!bankQuestionIds.size) {
    return stats;
  }

  const usageByQuestionId = new Map<
    string,
    { usedCount: number; totalPercent: number; scoredCount: number }
  >();

  for (const exam of exams ?? []) {
    const pointsByQuestionId = new Map(
      exam.questions.map((examQuestion) => [
        examQuestion.question.id,
        examQuestion.points,
      ]),
    );

    for (const examQuestion of exam.questions) {
      if (!bankQuestionIds.has(examQuestion.question.id)) {
        continue;
      }

      const current = usageByQuestionId.get(examQuestion.question.id) ?? {
        usedCount: 0,
        totalPercent: 0,
        scoredCount: 0,
      };

      current.usedCount += 1;

      for (const attempt of exam.attempts) {
        for (const answer of attempt.answers) {
          if (answer.question.id !== examQuestion.question.id) {
            continue;
          }

          const points = pointsByQuestionId.get(answer.question.id) ?? 0;

          if (!points) {
            continue;
          }

          const answerScore = (answer.autoScore ?? 0) + (answer.manualScore ?? 0);
          current.totalPercent += (answerScore / points) * 100;
          current.scoredCount += 1;
        }
      }

      usageByQuestionId.set(examQuestion.question.id, current);
    }
  }

  for (const [questionId, usage] of usageByQuestionId.entries()) {
    stats[questionId] = {
      usedCount: usage.usedCount,
      averageScorePercent: usage.scoredCount
        ? usage.totalPercent / usage.scoredCount
        : null,
    };
  }

  return stats;
};

export const getRelatedExamRows = (
  questions: BankQuestion[] | undefined,
  exams: ExamsData,
): QuestionBankRelatedExamRow[] => {
  const bankQuestionIds = new Set(questions?.map((question) => question.id) ?? []);

  if (!bankQuestionIds.size) {
    return [];
  }

  return (exams ?? [])
    .map((exam) => {
      const reusedQuestionCount = exam.questions.filter((examQuestion) =>
        bankQuestionIds.has(examQuestion.question.id),
      ).length;

      if (!reusedQuestionCount) {
        return null;
      }

      return {
        id: exam.id,
        title: exam.title,
        className: exam.class.name,
        questionCount: exam.questions.length,
        reusedQuestionCount,
        status: exam.status,
        isTemplate: exam.isTemplate,
        createdAt: exam.createdAt,
      };
    })
    .filter((row): row is QuestionBankRelatedExamRow => Boolean(row))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
};

export const getQuestionBankRows = (
  questions: BankQuestion[] | undefined,
  usageStats: QuestionUsageStats,
) => buildQuestionBankRows(questions ?? [], usageStats);

export const getFilteredQuestionRows = ({
  rows,
  search,
  topic,
  difficulty,
  type,
}: {
  rows: QuestionBankQuestionRow[];
  search: string;
  topic: string;
  difficulty: string;
  type: string;
}) => {
  const keyword = search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch = !keyword || row.text.toLowerCase().includes(keyword);
    const matchesTopic = topic === "Бүх сэдэв" || row.topic === topic;
    const matchesDifficulty =
      difficulty === "Бүх түвшин" || row.difficulty === difficulty;
    const matchesType = type === "Бүх төрөл" || row.type === type;

    return matchesSearch && matchesTopic && matchesDifficulty && matchesType;
  });
};

export const getTopicOptions = (rows: QuestionBankQuestionRow[]) => [
  "Бүх сэдэв",
  ...new Set(rows.map((row) => row.topic)),
];

export const getTypeOptions = (rows: QuestionBankQuestionRow[]) => [
  "Бүх төрөл",
  ...new Set(rows.map((row) => row.type)),
];

export const getDifficultyOptions = (rows: QuestionBankQuestionRow[]) => [
  "Бүх түвшин",
  ...new Set(rows.map((row) => row.difficulty)),
];
