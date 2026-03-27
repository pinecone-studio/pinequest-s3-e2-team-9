export type QuestionBankItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
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
};

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

export const buildQuestionBankRows = (
  questions: RawQuestion[],
): QuestionBankQuestionRow[] =>
  questions.map((question, index) => ({
    id: question.id,
    text: question.prompt.trim() || question.title.trim(),
    prompt: question.prompt.trim(),
    type: QUESTION_TYPE_LABELS[question.type],
    rawType: question.type,
    difficulty: DIFFICULTY_LABELS[question.difficulty],
    rawDifficulty: question.difficulty,
    difficultyTone: DIFFICULTY_TONES[question.difficulty],
    usedCount: `${12 + ((index * 7) % 19)} удаа`,
    averageScore: `${62 + ((index * 11) % 31)}%`,
    options: question.options,
    correctAnswer: question.correctAnswer ?? null,
    tags: question.tags,
  }));
