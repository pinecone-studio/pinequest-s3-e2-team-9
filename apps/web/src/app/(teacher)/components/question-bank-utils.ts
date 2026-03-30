export type QuestionBankItem = {
  id: string;
  title: string;
  displayTitle: string;
  description: string;
  grade: number;
  subject: string;
  topic: string;
  categoryLabel: string;
  topics: string[];
  subtopics?: string[];
  visibility: "PRIVATE" | "PUBLIC";
  ownerId: string;
  ownerName: string;
  questions: string;
  date: string;
};

type RawQuestion = {
  id: string;
  title: string;
  prompt: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "IMAGE_UPLOAD";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  options: string[];
  correctAnswer?: string | null;
  tags: string[];
};

export type QuestionBankQuestionRow = {
  id: string;
  text: string;
  prompt: string;
  topic: string;
  type: string;
  rawType: RawQuestion["type"];
  difficulty: string;
  rawDifficulty: RawQuestion["difficulty"];
  difficultyTone: string;
  usedCount: string;
  averageScore: string;
  options: string[];
  correctAnswer: string | null;
  tags: string[];
  variantGroupId: string | null;
  variantLabel: string | null;
  variantCount: number | null;
};

export type QuestionUsageStats = Record<
  string,
  {
    usedCount: number;
    averageScorePercent: number | null;
  }
>;

const QUESTION_TYPE_LABELS: Record<RawQuestion["type"], string> = {
  MCQ: "Олон сонголт",
  TRUE_FALSE: "Үнэн/Худал",
  SHORT_ANSWER: "Тоо бодолт",
  ESSAY: "Задгай хариулт",
  IMAGE_UPLOAD: "Зураг",
};

const DIFFICULTY_LABELS: Record<RawQuestion["difficulty"], string> = {
  EASY: "Хялбар",
  MEDIUM: "Дунд",
  HARD: "Хүнд",
};

const DIFFICULTY_TONES: Record<RawQuestion["difficulty"], string> = {
  EASY: "border-[#31AA4033] bg-[#31AA401A] text-[#31AA40]",
  MEDIUM: "border-[#EAB53233] bg-[#EAB5321A] text-[#161616]",
  HARD: "border-[#F0443833] bg-[#F044381A] text-[#B42318]",
};

const getVariantTagValue = (tags: string[], prefix: string) =>
  tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) ?? null;

export const formatQuestionAnswer = (row: QuestionBankQuestionRow) => {
  if (row.rawType === "TRUE_FALSE") {
    return row.correctAnswer === "True" ? "Үнэн" : "Худал";
  }
  if (row.rawType === "SHORT_ANSWER") {
    return row.correctAnswer || "Оруулаагүй";
  }
  if (row.rawType === "ESSAY") {
    return row.correctAnswer || "Жишиг хариулт оруулаагүй";
  }
  return row.correctAnswer || "Сонгоогүй";
};

export const formatTolerance = (tags: string[]) =>
  tags.find((tag) => tag.startsWith("tolerance:"))?.replace("tolerance:", "") ?? null;

export const formatQuestionBankDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const formatGradeLabel = (grade: number) =>
  grade > 0 ? `${grade}-р анги` : "Анги сонгоогүй";

export const formatVisibilityLabel = (visibility: QuestionBankItem["visibility"]) =>
  visibility === "PUBLIC" ? "Нэгдсэн сан" : "Миний сан";

export const buildQuestionBankRows = (
  questions: RawQuestion[],
  usageStats: QuestionUsageStats = {},
): QuestionBankQuestionRow[] =>
  questions
  .filter((question) => !question.tags.includes("variant_draft:true"))
  .map((question) => {
    const variantGroupId = getVariantTagValue(question.tags, "variant_group:");
    const variantLabel = getVariantTagValue(question.tags, "variant_label:");
    const variantCountValue = getVariantTagValue(question.tags, "variant_count:");
    const variantCount = variantCountValue ? Number(variantCountValue) : null;

    return {
      id: question.id,
      text: question.prompt.trim() || question.title.trim(),
      prompt: question.prompt.trim(),
      topic:
        question.tags.filter((tag) => tag && !tag.includes("анги"))[1] ??
        question.tags.filter((tag) => tag && !tag.includes("анги"))[0] ??
        question.title.trim(),
      type: QUESTION_TYPE_LABELS[question.type],
      rawType: question.type,
      difficulty: DIFFICULTY_LABELS[question.difficulty],
      rawDifficulty: question.difficulty,
      difficultyTone: DIFFICULTY_TONES[question.difficulty],
      usedCount: `${usageStats[question.id]?.usedCount ?? 0} удаа`,
      averageScore:
        usageStats[question.id]?.averageScorePercent === undefined ||
        usageStats[question.id]?.averageScorePercent === null
          ? "-"
          : `${Math.round(usageStats[question.id].averageScorePercent ?? 0)}%`,
      options: question.options,
      correctAnswer: question.correctAnswer ?? null,
      tags: question.tags,
      variantGroupId,
      variantLabel,
      variantCount: Number.isFinite(variantCount) ? variantCount : null,
    };
  });
