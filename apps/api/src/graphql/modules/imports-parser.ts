import type { Difficulty, QuestionType } from "../types";

export type ParsedImportQuestion = {
  type: QuestionType;
  title: string;
  prompt: string;
  options: string[];
  answers: string[];
  score: number;
  difficulty: Difficulty;
  sourcePage: number;
  confidence: number;
  needsReview: boolean;
};

type ParserState = {
  title: string;
  questions: ParsedImportQuestion[];
};

type WorkingQuestion = ParsedImportQuestion & {
  order: number;
};

const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
const cyrillicOptionLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З"] as const;
const optionLabelPattern = "[A-HАБВГДЕЁЖЗa-hабвгдеёжз]";
const questionStartPattern = /^(\d{1,3})\s*(?:[\.\):]|-\s+)\s*(.+)$/u;
const optionPattern = new RegExp(`^(${optionLabelPattern})\\s*[\\.)-]\\s*(.+)$`, "u");
const namedQuestionPattern = /^(?:асуулт|question)\s*(\d{1,3})\s*[:\-]?\s*(.*)$/iu;
const titledQuestionPattern = /^(.*?)\s*[-–]\s*(?:асуулт|question)\s*(\d{1,3})\s*[:\-]?\s*(.*)$/iu;
const answerPattern =
  /^(correct answer|answer key|answer|зөв хариулт|хариулт|хариу)\s*[:\-]\s*(.+)$/iu;
const scorePattern = /^(score|scores|point|points|оноо)\s*[:\-]\s*(\d+)$/iu;
const trailingScorePattern = /^(\d+)\s*оноо$/iu;
const pagePattern = /^(page|хуудас|хуудасны)\s*[:\-]?\s*(\d+)$/iu;
const mcqTypePattern = /^(олон сонголт|multiple choice)$/iu;
const shortAnswerTypePattern = /^(богино хариулт|short answer)$/iu;
const ignoredLinePatterns = [
  /^\d+\s*-\s*р\s+анги$/iu,
  /^хариултаа оруулахад автоматаар хадгална\.?$/iu,
  /^хугацаа\s*[–-]/iu,
  /^\d+\s*[–-]\s*\d+\s*р бодлого/u,
  /^\d+\s*[–-]\s*\d+\s*р\s+бодлого.*оноотой\.?$/iu,
  /^\d+\s*р\s+бодлого.*оноотой\.?$/iu,
  /^тест-\d+\b(?!.*(?:асуулт|question))/iu,
] as const;

const preferredTitlePattern =
  /(олимпиад|шалгалт|тест|exam|сорил)/iu;
const questionStartMarkerPattern = /^(\d{1,3})\s*(?:[\.\):]|-\s+)\s*(.+)$/u;

const stripBoilerplate = (value: string) =>
  value
    .replace(/хариултаа оруулахад автоматаар хадгална\.?/giu, " ")
    .replace(/\b(олон сонголт|multiple choice|богино хариулт|short answer)\b/giu, " ")
    .replace(/\b\d+\s*оноо\b/giu, " ")
    .replace(/\b\d+\s*[–-]\s*\d+\s*р\s+бодлого[^.\n]*оноотой\.?/giu, " ")
    .replace(/\b\d+\s*р\s+бодлого[^.\n]*оноотой\.?/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const normalizeRawTextForParsing = (rawText: string) =>
  rawText
    .replace(/\u00A0/gu, " ")
    .replace(/\r\n?/gu, "\n")
    .replace(/\s*\|\|\s*/gu, "\n")
    .replace(/[ \t]+/gu, " ")
    .replace(/([?!.])\s*(?=\d{1,3}\s*(?:[\.\):]|-\s+))/gu, "$1\n")
    .replace(/([^\n])\s+(?=(?:асуулт|question)\s*\d{1,3}\b)/giu, "$1\n")
    .replace(/(?<=\S)\s+(?=\d{1,3}\s*[\.\):-]\s+)/gu, "\n")
    .replace(
      new RegExp(`(?<=\\S)\\s+(?=${optionLabelPattern}\\s*[\\.)-]\\s+)`, "gu"),
      "\n",
    )
    .replace(
      /(?<=\S)\s+(?=(correct answer|answer key|answer|зөв хариулт|хариулт|хариу)\s*[:\-])/giu,
      "\n",
    )
    .replace(/(?<=\S)\s+(?=(score|scores|point|points|оноо)\s*[:\-])/giu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();

type SegmentedPage = {
  pageNumber: number;
  blocks: string[][];
};

const matchQuestionStart = (line: string): { order: number; prompt: string } | null => {
  const match = questionStartMarkerPattern.exec(line);
  if (!match?.[1] || !match[2]) {
    return null;
  }

  const order = Number.parseInt(match[1], 10);
  const prompt = stripBoilerplate(match[2].trim());

  if (!Number.isFinite(order) || order <= 0 || !prompt) {
    return null;
  }

  if (ignoredLinePatterns.some((pattern) => pattern.test(prompt))) {
    return null;
  }

  if (/^\d+(?:[.,]\d+)?$/u.test(prompt)) {
    return null;
  }

  if (/^[\d\s,.;]+$/u.test(prompt)) {
    return null;
  }

  const hasLetter = /[\p{L}]/u.test(prompt);
  const hasMathLead = /[()=+\-*/•]/u.test(prompt);
  if (!hasLetter && !hasMathLead) {
    return null;
  }

  return {
    order,
    prompt,
  };
};

const isQuestionStartLine = (line: string) =>
  Boolean(matchQuestionStart(line)) ||
  namedQuestionPattern.test(line) ||
  titledQuestionPattern.test(line);

const explodeLogicalLine = (line: string) =>
  normalizeRawTextForParsing(line)
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter(Boolean);

const segmentImportedExamText = (rawText: string): SegmentedPage[] => {
  const sourceLines = rawText.replace(/\r\n?/gu, "\n").split("\n");
  const pages: SegmentedPage[] = [];
  let currentPageNumber = 1;
  let currentBlocks: string[][] = [];
  let currentBlock: string[] = [];

  const flushBlock = () => {
    if (currentBlock.length > 0) {
      currentBlocks.push(currentBlock);
      currentBlock = [];
    }
  };

  const flushPage = () => {
    flushBlock();
    if (currentBlocks.length > 0 || pages.length === 0) {
      pages.push({
        pageNumber: currentPageNumber,
        blocks: currentBlocks,
      });
    }
    currentBlocks = [];
  };

  for (const sourceLine of sourceLines) {
    const trimmedSource = sourceLine.trim();
    if (!trimmedSource) {
      flushBlock();
      continue;
    }

    const pageMatch = pagePattern.exec(trimmedSource);
    if (pageMatch?.[2]) {
      if (currentBlocks.length > 0 || currentBlock.length > 0 || pages.length > 0) {
        flushPage();
      }
      currentPageNumber = Number.parseInt(pageMatch[2], 10) || currentPageNumber;
      continue;
    }

    const logicalLines = explodeLogicalLine(trimmedSource);
    for (const logicalLine of logicalLines) {
      if (ignoredLinePatterns.some((pattern) => pattern.test(logicalLine))) {
        flushBlock();
        continue;
      }

      if (pagePattern.test(logicalLine)) {
        flushBlock();
        continue;
      }

      if (isQuestionStartLine(logicalLine) && currentBlock.length > 0) {
        flushBlock();
      }

      currentBlock.push(logicalLine);
    }
  }

  flushPage();
  return pages.length > 0 ? pages : [{ pageNumber: 1, blocks: [] }];
};

const isLikelyInlineOption = (line: string) => {
  const normalized = stripBoilerplate(line);
  if (!normalized) {
    return false;
  }

  if (
    matchQuestionStart(normalized) ||
    namedQuestionPattern.test(normalized) ||
    titledQuestionPattern.test(normalized) ||
    answerPattern.test(normalized) ||
    scorePattern.test(normalized) ||
    trailingScorePattern.test(normalized) ||
    pagePattern.test(normalized) ||
    mcqTypePattern.test(normalized) ||
    shortAnswerTypePattern.test(normalized)
  ) {
    return false;
  }

  if (normalized.includes("?")) {
    return false;
  }

  return normalized.length <= 90 && normalized.split(/\s+/u).length <= 12;
};

const shouldIgnoreQuestionPrompt = (prompt: string) => {
  const normalized = stripBoilerplate(prompt).toLowerCase();
  if (!normalized) {
    return true;
  }

  return ignoredLinePatterns.some((pattern) => pattern.test(normalized));
};

const toCanonicalOptionLabel = (value: string) => {
  const normalized = value.trim().toUpperCase();
  const latinIndex = optionLabels.indexOf(normalized as (typeof optionLabels)[number]);
  if (latinIndex >= 0) {
    return optionLabels[latinIndex];
  }

  const cyrillicIndex = cyrillicOptionLabels.indexOf(
    normalized as (typeof cyrillicOptionLabels)[number],
  );
  if (cyrillicIndex >= 0) {
    return optionLabels[cyrillicIndex] ?? normalized;
  }

  return normalized;
};

const normalizeBooleanAnswer = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (["true", "үнэн", "vnen", "correct", "yes"].includes(normalized)) {
    return "True";
  }
  if (["false", "худал", "hudal", "incorrect", "no"].includes(normalized)) {
    return "False";
  }
  return value.trim();
};

const normalizeAnswers = (answers: string[], options: string[]) => {
  if (options.length === 2 && options[0] === "True" && options[1] === "False") {
    return answers.map(normalizeBooleanAnswer).filter(Boolean);
  }

  const normalizedOptions = options.map((option) => option.trim());
  return answers
    .map((answer) => {
      const normalizedAnswer = answer.trim();
      if (!normalizedAnswer) {
        return "";
      }

      const canonicalLabel = toCanonicalOptionLabel(normalizedAnswer);
      const optionIndex = optionLabels.indexOf(canonicalLabel as (typeof optionLabels)[number]);
      if (optionIndex >= 0) {
        return normalizedOptions[optionIndex] ?? normalizedAnswer;
      }

      return normalizedAnswer;
    })
    .filter(Boolean);
};

const splitAnswerValue = (value: string) =>
  value
    .split(/[,/;]|(?:\s+and\s+)|(?:\s+ба\s+)/iu)
    .map((item) => item.trim())
    .filter(Boolean);

const toDifficulty = (score: number): Difficulty => {
  if (score >= 3) {
    return "HARD";
  }
  if (score === 2) {
    return "MEDIUM";
  }
  return "EASY";
};

const toQuestionType = (question: WorkingQuestion): QuestionType => {
  if (question.type === "MCQ" || question.type === "SHORT_ANSWER") {
    return question.type;
  }

  const normalizedAnswers = question.answers.map((item) => item.trim().toLowerCase());
  const normalizedOptions = question.options.map((item) => item.trim().toLowerCase());
  const hasTrueFalseOptions =
    normalizedOptions.length === 2 &&
    (normalizedOptions.includes("true") || normalizedOptions.includes("үнэн")) &&
    (normalizedOptions.includes("false") || normalizedOptions.includes("худал"));

  if (
    hasTrueFalseOptions ||
    normalizedAnswers.some((item) => ["true", "false", "үнэн", "худал"].includes(item))
  ) {
    return "TRUE_FALSE";
  }

  if (question.options.length > 0) {
    return "MCQ";
  }

  return "SHORT_ANSWER";
};

const finalizeQuestion = (question: WorkingQuestion | null): ParsedImportQuestion | null => {
  if (!question) {
    return null;
  }

  const prompt = stripBoilerplate(question.prompt.trim());
  if (!prompt || shouldIgnoreQuestionPrompt(prompt)) {
    return null;
  }

  const type = toQuestionType(question);
  const rawAnswers = question.answers.map((item) => item.trim()).filter(Boolean);
  const options =
    type === "TRUE_FALSE"
      ? ["True", "False"]
      : question.options.map((item) => item.trim()).filter(Boolean);
  const answers = normalizeAnswers(rawAnswers, options);
  const confidenceBase =
    type === "MCQ"
      ? answers.length > 0 && options.length >= 2 ? 0.88 : 0.66
      : type === "TRUE_FALSE"
        ? answers.length > 0 ? 0.9 : 0.68
        : answers.length > 0 ? 0.72 : 0.52;
  const confidence = Number(confidenceBase.toFixed(2));

  return {
    type,
    title: question.title.trim() || `Асуулт ${question.order}`,
    prompt,
    options: options.map((option) => stripBoilerplate(option)).filter(Boolean),
    answers,
    score: question.score,
    difficulty: question.difficulty,
    sourcePage: question.sourcePage,
    confidence,
    needsReview: confidence < 0.75 || answers.length === 0,
  };
};

const createFallbackQuestion = (title: string, rawText: string): ParsedImportQuestion => ({
  type: "ESSAY",
  title: `${title} - Асуулт 1`,
  prompt: rawText.trim().slice(0, 1200),
  options: [],
  answers: [],
  score: 1,
  difficulty: "MEDIUM",
  sourcePage: 1,
  confidence: 0.41,
  needsReview: true,
});

const mergeParsedQuestions = (
  previous: ParsedImportQuestion,
  current: ParsedImportQuestion,
): ParsedImportQuestion => {
  const mergedOptions = [...previous.options, ...current.options].filter(Boolean);
  const mergedAnswers = [...previous.answers, ...current.answers].filter(Boolean);
  const mergedPrompt = [previous.prompt, current.prompt].filter(Boolean).join(" ").trim();

  return {
    ...previous,
    type:
      mergedOptions.length > 0 && previous.type === "SHORT_ANSWER"
        ? "MCQ"
        : previous.type,
    prompt: mergedPrompt || previous.prompt,
    options: mergedOptions,
    answers: mergedAnswers,
    score: Math.max(previous.score, current.score),
    confidence: Math.min(previous.confidence, current.confidence, 0.52),
    needsReview: true,
  };
};

const splitMergedQuestion = (
  question: ParsedImportQuestion,
  title: string,
): ParsedImportQuestion[] => {
  const nextOrder = question.title.match(/Асуулт\s+(\d+)/u)?.[1]
    ? Number.parseInt(question.title.match(/Асуулт\s+(\d+)/u)?.[1] ?? "", 10) + 1
    : question.title.match(/Question\s+(\d+)/u)?.[1]
      ? Number.parseInt(question.title.match(/Question\s+(\d+)/u)?.[1] ?? "", 10) + 1
      : null;

  if (!nextOrder) {
    return [question];
  }

  const embeddedMarker = new RegExp(`\\s+${nextOrder}\\s*[\\.)-]\\s+`, "u");
  const markerIndex = question.prompt.search(embeddedMarker);
  if (markerIndex < 0 || question.options.length < 8) {
    return [question];
  }

  const markerMatch = embeddedMarker.exec(question.prompt.slice(markerIndex));
  if (!markerMatch) {
    return [question];
  }

  const currentPrompt = question.prompt.slice(0, markerIndex).trim();
  const nextPrompt = question.prompt
    .slice(markerIndex + markerMatch[0].length)
    .trim();

  if (!currentPrompt || !nextPrompt) {
    return [question];
  }

  const splitIndex = question.options.length >= 8 ? 4 : Math.ceil(question.options.length / 2);
  const firstOptions = question.options.slice(0, splitIndex);
  const secondOptions = question.options.slice(splitIndex);

  if (firstOptions.length < 2 || secondOptions.length < 2) {
    return [question];
  }

  return [
    {
      ...question,
      prompt: currentPrompt,
      options: firstOptions,
      confidence: Math.min(question.confidence, 0.58),
      needsReview: true,
    },
    {
      ...question,
      title: `${title} - Асуулт ${nextOrder}`,
      prompt: nextPrompt,
      options: secondOptions,
      answers: [],
      confidence: Math.min(question.confidence, 0.56),
      needsReview: true,
    },
  ];
};

const parseQuestionBlock = (
  lines: string[],
  title: string,
  pageNumber: number,
  nextOrder: number,
): ParsedImportQuestion | null => {
  let currentQuestion: WorkingQuestion | null = null;

  for (const [index, line] of lines.entries()) {
    const titledQuestionMatch = titledQuestionPattern.exec(line);
    if (titledQuestionMatch?.[2]) {
      const order = Number.parseInt(titledQuestionMatch[2], 10) || nextOrder;
      currentQuestion = {
        order,
        type: "ESSAY",
        title: `${title} - Асуулт ${order}`,
        prompt: stripBoilerplate(titledQuestionMatch[3] ?? ""),
        options: [],
        answers: [],
        score: 1,
        difficulty: "EASY",
        sourcePage: pageNumber,
        confidence: 0.5,
        needsReview: true,
      };
      continue;
    }

    const namedQuestionMatch = namedQuestionPattern.exec(line);
    if (namedQuestionMatch?.[1]) {
      const order = Number.parseInt(namedQuestionMatch[1], 10) || nextOrder;
      currentQuestion = {
        order,
        type: "ESSAY",
        title: `${title} - Асуулт ${order}`,
        prompt: stripBoilerplate(namedQuestionMatch[2] ?? ""),
        options: [],
        answers: [],
        score: 1,
        difficulty: "EASY",
        sourcePage: pageNumber,
        confidence: 0.5,
        needsReview: true,
      };
      continue;
    }

    const questionMatch = matchQuestionStart(line);
    if (questionMatch) {
      const order = questionMatch.order || nextOrder;
      currentQuestion = {
        order,
        type: "ESSAY",
        title: `${title} - Асуулт ${order}`,
        prompt: questionMatch.prompt,
        options: [],
        answers: [],
        score: 1,
        difficulty: "EASY",
        sourcePage: pageNumber,
        confidence: 0.5,
        needsReview: true,
      };
      continue;
    }

    if (!currentQuestion) {
      continue;
    }

    if (mcqTypePattern.test(line)) {
      currentQuestion.type = "MCQ";
      continue;
    }

    if (shortAnswerTypePattern.test(line)) {
      currentQuestion.type = "SHORT_ANSWER";
      continue;
    }

    const optionMatch = optionPattern.exec(line);
    if (optionMatch?.[2]) {
      currentQuestion.options.push(stripBoilerplate(optionMatch[2].trim()));
      continue;
    }

    const answerMatch = answerPattern.exec(line);
    if (answerMatch?.[2]) {
      currentQuestion.answers = splitAnswerValue(answerMatch[2]);
      continue;
    }

    const scoreMatch = scorePattern.exec(line);
    if (scoreMatch?.[2]) {
      const score = Number.parseInt(scoreMatch[2], 10);
      if (Number.isFinite(score) && score > 0) {
        currentQuestion.score = score;
        currentQuestion.difficulty = toDifficulty(score);
      }
      continue;
    }

    const trailingScoreMatch = trailingScorePattern.exec(line);
    if (trailingScoreMatch?.[1]) {
      const score = Number.parseInt(trailingScoreMatch[1], 10);
      if (Number.isFinite(score) && score > 0) {
        currentQuestion.score = score;
        currentQuestion.difficulty = toDifficulty(score);
      }
      continue;
    }

    const nextLine = lines[index + 1] ?? "";
    if (
      currentQuestion.type === "MCQ" &&
      isLikelyInlineOption(line) &&
      (currentQuestion.options.length > 0 || isLikelyInlineOption(nextLine))
    ) {
      currentQuestion.options.push(stripBoilerplate(line));
      continue;
    }

    currentQuestion.prompt = `${currentQuestion.prompt} ${line}`.trim();
  }

  return finalizeQuestion(currentQuestion);
};

export const parseImportedExamText = (
  rawText: string,
  fallbackTitle: string,
): ParserState => {
  const pages = segmentImportedExamText(rawText);
  const allLines = pages.flatMap((page) => page.blocks.flat());
  const titledPrefix =
    allLines
      .map((line) => titledQuestionPattern.exec(line)?.[1]?.trim() ?? "")
      .find((prefix) => prefix.length > 0 && preferredTitlePattern.test(prefix)) ??
    allLines
      .map((line) => titledQuestionPattern.exec(line)?.[1]?.trim() ?? "")
      .find((prefix) => prefix.length > 6) ??
    null;
  const titleCandidate =
    allLines.find(
      (line) =>
        preferredTitlePattern.test(line) &&
        !matchQuestionStart(line) &&
        !namedQuestionPattern.test(line) &&
        !titledQuestionPattern.test(line),
    ) ??
    allLines.find(
    (line) =>
      !matchQuestionStart(line) &&
      !namedQuestionPattern.test(line) &&
      !titledQuestionPattern.test(line) &&
      !optionPattern.test(line) &&
      !answerPattern.test(line) &&
      !scorePattern.test(line) &&
      !trailingScorePattern.test(line) &&
      !pagePattern.test(line) &&
      !isLikelyInlineOption(line),
  );
  const titleSource =
    (titledPrefix && preferredTitlePattern.test(titledPrefix) ? titledPrefix : null) ||
    (titleCandidate && preferredTitlePattern.test(titleCandidate) ? titleCandidate : null) ||
    fallbackTitle;
  const title = titleSource.length ? titleSource.slice(0, 120) : fallbackTitle;
  const questions: ParsedImportQuestion[] = [];
  let lastAcceptedOrder = 0;
  for (const page of pages) {
    for (const block of page.blocks) {
      const parsedQuestion = parseQuestionBlock(block, title, page.pageNumber, questions.length + 1);
      if (parsedQuestion) {
        for (const candidate of splitMergedQuestion(parsedQuestion, title)) {
          const candidateOrder =
            Number.parseInt(candidate.title.match(/Асуулт\s+(\d+)/u)?.[1] ?? "", 10) ||
            Number.parseInt(candidate.title.match(/Question\s+(\d+)/u)?.[1] ?? "", 10) ||
            questions.length + 1;

          if (questions.length > 0 && candidateOrder <= lastAcceptedOrder) {
            questions[questions.length - 1] = mergeParsedQuestions(
              questions[questions.length - 1],
              candidate,
            );
            continue;
          }

          questions.push(candidate);
          lastAcceptedOrder = candidateOrder;
        }
      }
    }
  }

  return {
    title,
    questions: questions.length > 0 ? questions : [createFallbackQuestion(title, rawText)],
  };
};
