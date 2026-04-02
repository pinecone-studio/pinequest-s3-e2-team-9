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
  sourceExcerpt: string;
  sourceBlockId: string;
  sourceBboxJson: string | null;
  confidence: number;
  needsReview: boolean;
};

type StructuredImportBbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type StructuredImportLine = {
  id: string;
  text: string;
  bbox: StructuredImportBbox;
};

type StructuredImportBlock = {
  id: string;
  pageNumber: number;
  type: "header" | "section" | "question" | "options" | "table" | "text";
  columnIndex: 0 | 1 | null;
  bbox: StructuredImportBbox;
  text: string;
  lines: StructuredImportLine[];
  sourceEngine: string;
};

type StructuredImportPage = {
  number: number;
  width: number;
  height: number;
  layout: "single-column" | "two-column";
  blocks: StructuredImportBlock[];
  text: string;
};

type StructuredImportDocument = {
  pages: StructuredImportPage[];
  fullText: string;
  classifier?: {
    documentKind?: string;
    layout?: string;
    tableHeavy?: boolean;
    needsOcr?: boolean;
    recommendedEngine?: string;
    enginesUsed?: string[];
  };
};

type StructuredRowEntry = {
  text: string;
  x: number;
  y: number;
  height: number;
};

type ParserState = {
  title: string;
  questions: ParsedImportQuestion[];
};

type WorkingQuestion = ParsedImportQuestion & {
  order: number;
};

type StructuredQuestionBuilder = {
  order: number;
  score: number;
  pageNumber: number;
  sourceBlockId: string;
  sourceBboxJson: string | null;
  sourceLines: string[];
  promptLines: string[];
  options: string[];
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
const inlineScorePattern =
  /(?:^|[\s([{-])(\d+)\s*(?:оноо|оноотой|point|points)(?=$|[\s)\]}.!,;:])/iu;
const questionScoreRangePattern =
  /^(\d+)\s*[–-]\s*(\d+)\s*[–-]?\s*р\s+бодлого(?:\s+тус\s+бүр)?[^.\n]*?(\d+)\s*оноотой\.?$/iu;
const questionScoreSinglePattern =
  /^(\d+)\s*[–-]?\s*р\s+бодлого(?:\s+тус\s+бүр)?[^.\n]*?(\d+)\s*оноотой\.?$/iu;
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
const strictOlympiadQuestionStartPattern = /^(\d{1,2})\s*[\.\)]\s*(.+)$/u;
const sectionScorePattern =
  /^(\d{1,3})\s*[–-]\s*(\d{1,3})\s*р\s+бодлого.*?(\d+)\s*оноотой\.?$/iu;

const stripBoilerplate = (value: string) =>
  value
    .replace(/хариултаа оруулахад автоматаар хадгална\.?/giu, " ")
    .replace(/\b(олон сонголт|multiple choice|богино хариулт|short answer)\b/giu, " ")
    .replace(
      /(?:^|[\s([{-])\d+\s*(?:оноо|оноотой|point|points)(?=$|[\s)\]}.!,;:])/giu,
      " ",
    )
    .replace(/\b\d+\s*[–-]\s*\d+\s*р\s+бодлого[^.\n]*оноотой\.?/giu, " ")
    .replace(/\b\d+\s*р\s+бодлого[^.\n]*оноотой\.?/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const toSourceExcerpt = (lines: string[]) =>
  lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .slice(0, 1600)
    .trim();

const toBboxJson = (bbox: StructuredImportBbox | null | undefined) =>
  bbox ? JSON.stringify(bbox) : null;

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

const isFallbackTitleNoise = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return true;
  }

  if (preferredTitlePattern.test(normalized)) {
    return false;
  }

  if (/\d{6,}/u.test(normalized)) {
    return true;
  }

  if (!/[\u0400-\u04FF]/u.test(normalized) && /^[a-z0-9 _.-]+$/iu.test(normalized)) {
    return true;
  }

  return false;
};

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

const splitBlockIntoQuestionGroups = (lines: string[]) => {
  const groups: string[][] = [];
  let currentGroup: string[] = [];

  for (const line of lines) {
    if (isQuestionStartLine(line) && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [line];
      continue;
    }

    currentGroup.push(line);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};

const explodeLogicalLine = (line: string) =>
  normalizeRawTextForParsing(line)
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter(Boolean);
const parseDeclaredScoreRule = (line: string): { orders: number[]; score: number } | null => {
  const rangeMatch = questionScoreRangePattern.exec(line);
  if (rangeMatch?.[1] && rangeMatch[2] && rangeMatch[3]) {
    const start = Number.parseInt(rangeMatch[1], 10);
    const end = Number.parseInt(rangeMatch[2], 10);
    const score = Number.parseInt(rangeMatch[3], 10);
    if (Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(score) && score > 0) {
      const orders = Array.from(
        { length: Math.max(end - start + 1, 0) },
        (_, index) => start + index,
      );
      return { orders, score };
    }
  }

  const singleMatch = questionScoreSinglePattern.exec(line);
  if (singleMatch?.[1] && singleMatch[2]) {
    const order = Number.parseInt(singleMatch[1], 10);
    const score = Number.parseInt(singleMatch[2], 10);
    if (Number.isFinite(order) && Number.isFinite(score) && score > 0) {
      return { orders: [order], score };
    }
  }

  return null;
};

const parseInlineScore = (line: string): number | null => {
  const scoreMatch = scorePattern.exec(line);
  if (scoreMatch?.[2]) {
    const score = Number.parseInt(scoreMatch[2], 10);
    return Number.isFinite(score) && score > 0 ? score : null;
  }

  const trailingScoreMatch = trailingScorePattern.exec(line);
  if (trailingScoreMatch?.[1]) {
    const score = Number.parseInt(trailingScoreMatch[1], 10);
    return Number.isFinite(score) && score > 0 ? score : null;
  }

  const inlineMatch = inlineScorePattern.exec(line);
  if (inlineMatch?.[1]) {
    const score = Number.parseInt(inlineMatch[1], 10);
    return Number.isFinite(score) && score > 0 ? score : null;
  }

  return null;
};

const collectDeclaredScores = (
  lines: string[],
  baseScores: Map<number, number>,
) => {
  const nextScores = new Map(baseScores);

  for (const line of lines) {
    const declaredScoreRule = parseDeclaredScoreRule(line);
    if (!declaredScoreRule) {
      continue;
    }

    for (const order of declaredScoreRule.orders) {
      nextScores.set(order, declaredScoreRule.score);
    }
  }

  return nextScores;
};

const splitInlineOptionSegments = (value: string) => {
  const matches = [...value.matchAll(new RegExp(`(${optionLabelPattern})\\s*[\\.)-]\\s*`, "gu"))];
  if (matches.length === 0) {
    return [];
  }

  const leadingValue = value.slice(0, matches[0]?.index ?? 0).trim();
  const firstLabel = toCanonicalOptionLabel(matches[0]?.[1] ?? "");
  const shouldInjectLeadingOption =
    matches.length >= 2 &&
    firstLabel !== "A" &&
    leadingValue.length > 0 &&
    leadingValue.length <= 40 &&
    leadingValue.split(/\s+/u).length <= 6;

  return [
    ...(shouldInjectLeadingOption
      ? [
          {
            label: "A",
            labelStart: 0,
            value: stripBoilerplate(leadingValue),
          },
        ]
      : []),
    ...matches.map((match, index) => {
      const label = match[1]?.trim() ?? "";
      const labelStart = match.index ?? 0;
      const start = labelStart + match[0].length;
      const end = index + 1 < matches.length ? (matches[index + 1]?.index ?? value.length) : value.length;
      return {
        label,
        labelStart,
        value: stripBoilerplate(value.slice(start, end).trim()),
      };
    }),
  ];
};

const matchStrictOlympiadQuestionStart = (line: string) => {
  const match = strictOlympiadQuestionStartPattern.exec(line.trim());
  if (!match?.[1] || !match[2]) {
    return null;
  }

  const order = Number.parseInt(match[1], 10);
  if (!Number.isFinite(order) || order <= 0) {
    return null;
  }

  return {
    order,
    prompt: stripBoilerplate(match[2].trim()),
  };
};

const splitByExpectedQuestionMarker = (line: string, expectedOrder: number) => {
  const marker = new RegExp(`^(.*?)\\s+(${expectedOrder}\\s*[\\.)]\\s*.+)$`, "u");
  const match = marker.exec(line.trim());
  if (!match?.[2]) {
    return null;
  }

  return {
    before: match[1]?.trim() ?? "",
    after: match[2].trim(),
  };
};

type ExpectedQuestionSplit = ReturnType<typeof splitByExpectedQuestionMarker>;

const isLikelyOlympiadFormat = (pages: SegmentedPage[]) => {
  const allLines = pages.flatMap((page) => page.blocks.flat());
  const questionStarts = allLines.filter((line) => matchQuestionStart(line)).length;
  const optionMarkers = allLines.filter((line) => optionPattern.test(line)).length;
  const sectionHeadings = allLines.filter((line) => sectionScorePattern.test(line)).length;
  return questionStarts >= 8 && (optionMarkers >= 8 || sectionHeadings >= 1);
};

const buildQuestionFromChunk = ({
  title,
  pageNumber,
  order,
  score,
  lines,
  sourceBlockId,
  sourceBboxJson,
}: {
  title: string;
  pageNumber: number;
  order: number;
  score: number;
  lines: string[];
  sourceBlockId: string;
  sourceBboxJson: string | null;
}): ParsedImportQuestion | null => {
  if (lines.length === 0) {
    return null;
  }

  const sourceExcerpt = toSourceExcerpt(lines);
  const normalizedLines = lines
    .map((line, index) =>
      index === 0 ? line.replace(/^\d{1,3}\s*(?:[\.\):]|-\s+)/u, "").trim() : line.trim(),
    )
    .filter(Boolean);
  const promptParts: string[] = [];
  const options: string[] = [];

  for (const line of normalizedLines) {
    const optionMatch = optionPattern.exec(line);
    if (optionMatch?.[2]) {
      options.push(stripBoilerplate(optionMatch[2].trim()));
      continue;
    }

    promptParts.push(line);
  }

  const promptBody = promptParts.join(" ").replace(/\s+/gu, " ").trim();
  const { promptPart, options: inlineOptions } = splitPromptAndInlineOptions(promptBody);
  const prompt = stripBoilerplate(promptPart.replace(/\s+/gu, " ").trim());
  const normalizedOptions = [...options, ...inlineOptions].filter(Boolean).slice(0, 4);

  if (!prompt || shouldIgnoreQuestionPrompt(prompt)) {
    return null;
  }

  const type: QuestionType = normalizedOptions.length >= 2 ? "MCQ" : "SHORT_ANSWER";
  const confidence =
    type === "MCQ"
      ? normalizedOptions.length >= 4
        ? 0.82
        : 0.66
      : prompt.endsWith("?")
        ? 0.62
        : 0.52;

  return {
    type,
    title: `${title} - Асуулт ${order}`,
    prompt,
    options: normalizedOptions,
    answers: [],
    score,
    difficulty: toDifficulty(score),
    sourcePage: pageNumber,
    sourceExcerpt,
    sourceBlockId,
    sourceBboxJson,
    confidence,
    needsReview: true,
  };
};

type OlympiadQuestionBuilder = {
  order: number;
  pageNumber: number;
  score: number;
  sourceBlockId: string;
  sourceBboxJson: string | null;
  promptParts: string[];
  options: string[];
  sourceLines: string[];
};

const splitPromptAndInlineOptions = (value: string) => {
  const normalized = value.trim();
  const optionSegments = splitInlineOptionSegments(normalized);
  if (optionSegments.length === 0) {
    return {
      promptPart: normalized,
      options: [] as string[],
    };
  }

  return {
    promptPart: normalized.slice(0, optionSegments[0]?.labelStart ?? normalized.length).trim(),
    options: optionSegments.map((segment) => segment.value).filter(Boolean),
  };
};

const finalizeOlympiadQuestionBuilder = (
  title: string,
  builder: OlympiadQuestionBuilder | null,
): ParsedImportQuestion | null => {
  if (!builder) {
    return null;
  }

  const promptBody = builder.promptParts.join(" ").replace(/\s+/gu, " ").trim();
  const { promptPart, options: inlineOptions } = splitPromptAndInlineOptions(promptBody);
  const prompt = stripBoilerplate(promptPart);
  const options = [...builder.options, ...inlineOptions].filter(Boolean).slice(0, 4);

  if (!prompt || shouldIgnoreQuestionPrompt(prompt)) {
    return null;
  }

  const type: QuestionType = options.length >= 2 ? "MCQ" : "SHORT_ANSWER";
  const confidence =
    type === "MCQ"
      ? options.length >= 4
        ? 0.86
        : 0.74
      : prompt.endsWith("?")
        ? 0.64
        : 0.54;

  return {
    type,
    title: `${title} - Асуулт ${builder.order}`,
    prompt,
    options,
    answers: [],
    score: builder.score,
    difficulty: toDifficulty(builder.score),
    sourcePage: builder.pageNumber,
    sourceExcerpt: toSourceExcerpt(builder.sourceLines),
    sourceBlockId: builder.sourceBlockId,
    sourceBboxJson: builder.sourceBboxJson,
    confidence,
    needsReview: true,
  };
};

const isStructuredImportDocument = (value: unknown): value is StructuredImportDocument =>
  typeof value === "object" &&
  value !== null &&
  "pages" in value &&
  Array.isArray((value as { pages?: unknown }).pages);

const parseStructuredImportDocument = (
  extractionJson: string | null | undefined,
): StructuredImportDocument | null => {
  if (!extractionJson?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(extractionJson) as unknown;
    return isStructuredImportDocument(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const toVisualRowTolerance = (pageHeight: number, heights: number[]) => {
  const sortedHeights = heights
    .filter((height) => Number.isFinite(height) && height > 0)
    .sort((left, right) => left - right);
  const medianHeight =
    sortedHeights.length > 0
      ? sortedHeights[Math.floor(sortedHeights.length / 2)] ?? 0
      : 0;

  return Math.max(pageHeight * 0.006, medianHeight * 0.8, 0.05);
};

const buildStructuredSegmentedPages = (
  document: StructuredImportDocument,
  direction: "asc" | "desc",
): SegmentedPage[] =>
  document.pages.map((page) => {
    const lineEntries: StructuredRowEntry[] = page.blocks
      .flatMap((block) =>
        block.lines.map((line) => ({
          text: line.text.trim(),
          x: line.bbox.x,
          y: line.bbox.y,
          height: line.bbox.height,
        })),
      )
      .filter((entry) => entry.text.length > 0);

    if (lineEntries.length === 0) {
      return {
        pageNumber: page.number,
        blocks: page.blocks
          .map((block) =>
            block.text
              .split(/\r?\n/u)
              .map((line) => line.trim())
              .filter(Boolean),
          )
          .filter((blockLines) => blockLines.length > 0),
      };
    }

    const sortedEntries = [...lineEntries].sort((left, right) => {
      if (left.y === right.y) {
        return left.x - right.x;
      }

      return direction === "asc" ? left.y - right.y : right.y - left.y;
    });
    const tolerance = toVisualRowTolerance(
      page.height,
      sortedEntries.map((entry) => entry.height),
    );
    const rows: StructuredRowEntry[][] = [];

    for (const entry of sortedEntries) {
      const currentRow = rows.at(-1);
      if (!currentRow) {
        rows.push([entry]);
        continue;
      }

      const anchorY = currentRow[0]?.y ?? entry.y;
      if (Math.abs(entry.y - anchorY) <= tolerance) {
        currentRow.push(entry);
        continue;
      }

      rows.push([entry]);
    }

    const blocks = rows
      .map((row) =>
        row
          .sort((left, right) => left.x - right.x)
          .map((entry) => entry.text)
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/gu, " ")
          .trim(),
      )
      .filter(Boolean)
      .map((line) => [line]);

    return {
      pageNumber: page.number,
      blocks,
    };
  });

const buildStructuredSegmentedPagesFromLineOrder = (
  document: StructuredImportDocument,
): SegmentedPage[] =>
  document.pages.map((page) => ({
    pageNumber: page.number,
    blocks: page.blocks
      .flatMap((block) =>
        block.lines.length > 0
          ? block.lines
              .map((line) => line.text.trim())
              .filter(Boolean)
              .map((line) => [line])
          : block.text
              .split(/\r?\n/u)
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => [line]),
      )
      .filter((blockLines) => blockLines.length > 0),
  }));

const getParsedQuestionOrder = (question: ParsedImportQuestion) => {
  const mongolianMatch = question.title.match(/Асуулт\s+(\d+)/u);
  if (mongolianMatch?.[1]) {
    return Number.parseInt(mongolianMatch[1], 10) || 0;
  }

  const englishMatch = question.title.match(/Question\s+(\d+)/u);
  if (englishMatch?.[1]) {
    return Number.parseInt(englishMatch[1], 10) || 0;
  }

  return 0;
};

const scoreStructuredOlympiadCandidate = (questions: ParsedImportQuestion[]) => {
  if (questions.length === 0) {
    return -1;
  }

  const orders = questions.map(getParsedQuestionOrder).filter((order) => order > 0);
  let consecutiveCount = 0;
  for (let index = 1; index < orders.length; index += 1) {
    if ((orders[index] ?? 0) === (orders[index - 1] ?? 0) + 1) {
      consecutiveCount += 1;
    }
  }

  const startsAtOne = orders[0] === 1 ? 2 : 0;
  return questions.length * 10 + consecutiveCount * 4 + startsAtOne;
};

const pickBestStructuredOlympiadQuestions = (
  document: StructuredImportDocument,
  title: string,
) => {
  const candidates = [
    parseOlympiadStyleQuestions(buildStructuredSegmentedPages(document, "asc"), title),
    parseOlympiadStyleQuestions(buildStructuredSegmentedPages(document, "desc"), title),
    parseOlympiadStyleQuestions(buildStructuredSegmentedPagesFromLineOrder(document), title),
  ];

  return candidates.reduce<ParsedImportQuestion[]>(
    (best, candidate) =>
      scoreStructuredOlympiadCandidate(candidate) > scoreStructuredOlympiadCandidate(best)
        ? candidate
        : best,
    [],
  );
};

const parseQuestionsFromStructuredDocument = (
  document: StructuredImportDocument,
  title: string,
) => {
  const questions: ParsedImportQuestion[] = [];

  for (const page of document.pages) {
    let currentScore = 1;
    let currentQuestion: StructuredQuestionBuilder | null = null;

    const flushCurrent = () => {
      if (!currentQuestion) {
        return;
      }

      const parsed = finalizeOlympiadQuestionBuilder(title, {
        order: currentQuestion.order,
        pageNumber: currentQuestion.pageNumber,
        score: currentQuestion.score,
        sourceBlockId: currentQuestion.sourceBlockId,
        sourceBboxJson: currentQuestion.sourceBboxJson,
        promptParts: currentQuestion.promptLines,
        options: currentQuestion.options,
        sourceLines: currentQuestion.sourceLines,
      });
      if (parsed) {
        questions.push(parsed);
      }
      currentQuestion = null;
    };

    for (const block of page.blocks) {
      if (block.type === "header") {
        continue;
      }

      const logicalLines =
        block.lines.length > 0
          ? block.lines.map((line) => line.text.trim()).filter(Boolean)
          : block.text
              .split(/\r?\n/u)
              .map((line) => line.trim())
              .filter(Boolean);

      for (const rawLine of logicalLines) {
        const line = stripBoilerplate(rawLine);
        if (!line) {
          continue;
        }

        const sectionMatch = sectionScorePattern.exec(line);
        if (sectionMatch?.[3]) {
          flushCurrent();
          currentScore = Number.parseInt(sectionMatch[3], 10) || currentScore;
          continue;
        }

        const expectedOrder = questions.length + (currentQuestion ? 2 : 1);
        const splitLine: ExpectedQuestionSplit = currentQuestion
          ? splitByExpectedQuestionMarker(rawLine, expectedOrder)
          : null;
        if (splitLine && currentQuestion) {
          if (splitLine.before) {
            currentQuestion.sourceLines.push(splitLine.before);
            const optionMatch = optionPattern.exec(splitLine.before);
            if (optionMatch?.[2]) {
              currentQuestion.options.push(stripBoilerplate(optionMatch[2].trim()));
            } else {
              const split = splitPromptAndInlineOptions(splitLine.before);
              if (split.promptPart) {
                currentQuestion.promptLines.push(split.promptPart);
              }
              if (split.options.length > 0) {
                currentQuestion.options.push(...split.options);
              }
            }
          }

          flushCurrent();
        }

        const questionMatch = matchStrictOlympiadQuestionStart(splitLine?.after ?? rawLine);
        if (questionMatch && questionMatch.order === questions.length + 1) {
          flushCurrent();
          const sourceLine: string = splitLine?.after ?? rawLine;
          const content = sourceLine.replace(strictOlympiadQuestionStartPattern, "$2").trim();
          const split = splitPromptAndInlineOptions(content);
          currentQuestion = {
            order: questionMatch.order,
            pageNumber: page.number,
            score: currentScore,
            sourceBlockId: block.id,
            sourceBboxJson: toBboxJson(block.bbox),
            sourceLines: [sourceLine],
            promptLines: split.promptPart ? [split.promptPart] : [],
            options: split.options,
          };
          continue;
        }

        if (!currentQuestion) {
          continue;
        }

        currentQuestion.sourceLines.push(rawLine);
        const optionMatch = optionPattern.exec(rawLine);
        if (optionMatch?.[2]) {
          currentQuestion.options.push(stripBoilerplate(optionMatch[2].trim()));
          continue;
        }

        const split = splitPromptAndInlineOptions(rawLine);
        if (split.promptPart) {
          currentQuestion.promptLines.push(split.promptPart);
        }
        if (split.options.length > 0) {
          currentQuestion.options.push(...split.options);
        }
      }
    }

    flushCurrent();
  }

  return questions;
};

const collectSectionScoreMarkers = (pageText: string) => {
  const markers: Array<{ index: number; score: number }> = [];
  const regex = new RegExp(sectionScorePattern.source, "giu");

  let match = regex.exec(pageText);
  while (match) {
    markers.push({
      index: match.index,
      score: Number.parseInt(match[3] ?? "1", 10) || 1,
    });
    match = regex.exec(pageText);
  }

  return markers;
};

const findNearestScoreForIndex = (
  markers: Array<{ index: number; score: number }>,
  index: number,
) =>
  markers
    .filter((marker) => marker.index <= index)
    .at(-1)?.score ?? 1;

const collectOlympiadQuestionMarkers = (pageText: string) => {
  const markers: Array<{ index: number; order: number }> = [];
  const regex = /(^|\n|\s)(\d{1,2})\s*[.)]\s+/gu;

  let match = regex.exec(pageText);
  while (match) {
    const order = Number.parseInt(match[2] ?? "", 10);
    if (Number.isFinite(order) && order > 0 && order <= 40) {
      const leading = match[1]?.length ?? 0;
      markers.push({
        index: (match.index ?? 0) + leading,
        order,
      });
    }
    match = regex.exec(pageText);
  }

  return markers.sort((left, right) => left.index - right.index);
};

const parseOlympiadStyleQuestionsFromMarkers = (
  pageText: string,
  pageNumber: number,
  title: string,
) => {
  const markers = collectOlympiadQuestionMarkers(pageText);
  const scoreMarkers = collectSectionScoreMarkers(pageText);
  const questions: ParsedImportQuestion[] = [];
  let lastAcceptedOrder = 0;

  for (let index = 0; index < markers.length; index += 1) {
    const current = markers[index];
    if (!current || current.order <= lastAcceptedOrder) {
      continue;
    }

    let nextIndex = pageText.length;
    for (let lookahead = index + 1; lookahead < markers.length; lookahead += 1) {
      const candidate = markers[lookahead];
      if (candidate && candidate.order > current.order) {
        nextIndex = candidate.index;
        break;
      }
    }

    const chunkText = pageText.slice(current.index, nextIndex).trim();
    const chunkLines = chunkText
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean);
    const parsed = buildQuestionFromChunk({
      title,
      pageNumber,
      order: current.order,
      score: findNearestScoreForIndex(scoreMarkers, current.index),
      lines: chunkLines,
      sourceBlockId: `page-${pageNumber}-legacy-block-${current.order}`,
      sourceBboxJson: null,
    });

    if (parsed) {
      questions.push(parsed);
      lastAcceptedOrder = current.order;
    }
  }

  return questions;
};

const parseOlympiadStyleQuestions = (
  pages: SegmentedPage[],
  title: string,
): ParsedImportQuestion[] => {
  const questions: ParsedImportQuestion[] = [];

  for (const page of pages) {
    const lines = page.blocks.flat();
    const pageText = lines.join("\n");
    const markerQuestions = parseOlympiadStyleQuestionsFromMarkers(
      pageText,
      page.pageNumber,
      title,
    );
    if (markerQuestions.length >= 4) {
      questions.push(...markerQuestions);
      continue;
    }

    let currentScore = 1;
    let currentQuestion: OlympiadQuestionBuilder | null = null;

    const flushCurrent = () => {
      const parsed = finalizeOlympiadQuestionBuilder(title, currentQuestion);
      if (parsed) {
        questions.push(parsed);
      }
      currentQuestion = null;
    };

    for (const line of lines) {
      const sectionMatch = sectionScorePattern.exec(line);
      if (sectionMatch?.[3]) {
        flushCurrent();
        currentScore = Number.parseInt(sectionMatch[3], 10) || currentScore;
        continue;
      }

      const expectedOrder: number = questions.length + (currentQuestion ? 2 : 1);
      const splitLine = splitByExpectedQuestionMarker(line, expectedOrder);
      if (splitLine && currentQuestion) {
        if (splitLine.before) {
          currentQuestion.sourceLines.push(splitLine.before);
          const optionMatch = optionPattern.exec(splitLine.before);
          if (optionMatch?.[2]) {
            currentQuestion.options.push(stripBoilerplate(optionMatch[2].trim()));
          } else {
            const { promptPart, options } = splitPromptAndInlineOptions(splitLine.before);
            if (options.length > 0) {
              currentQuestion.options.push(...options);
            }
            if (promptPart) {
              currentQuestion.promptParts.push(promptPart);
            }
          }
        }

        flushCurrent();
        const remainder = splitLine.after.replace(strictOlympiadQuestionStartPattern, "$2").trim();
        const { promptPart, options } = splitPromptAndInlineOptions(remainder);
        currentQuestion = {
          order: expectedOrder,
          pageNumber: page.pageNumber,
          score: currentScore,
          sourceBlockId: `page-${page.pageNumber}-legacy-block-${expectedOrder}`,
          sourceBboxJson: null,
          promptParts: promptPart ? [promptPart] : [],
          options,
          sourceLines: [splitLine.after],
        };
        continue;
      }

      const questionMatch = matchStrictOlympiadQuestionStart(line);
      if (questionMatch && questionMatch.order === expectedOrder) {
        flushCurrent();
        const remainder = line.replace(strictOlympiadQuestionStartPattern, "$2").trim();
        const { promptPart, options } = splitPromptAndInlineOptions(remainder);
        currentQuestion = {
          order: expectedOrder,
          pageNumber: page.pageNumber,
          score: currentScore,
          sourceBlockId: `page-${page.pageNumber}-legacy-block-${expectedOrder}`,
          sourceBboxJson: null,
          promptParts: promptPart ? [promptPart] : [],
          options,
          sourceLines: [line],
        };
        continue;
      }

      if (!currentQuestion) {
        continue;
      }

      currentQuestion.sourceLines.push(line);

      const optionMatch = optionPattern.exec(line);
      if (optionMatch?.[2]) {
        currentQuestion.options.push(stripBoilerplate(optionMatch[2].trim()));
        continue;
      }

      const { promptPart, options } = splitPromptAndInlineOptions(line);
      if (options.length > 0) {
        currentQuestion.options.push(...options);
      }
      if (promptPart) {
        currentQuestion.promptParts.push(promptPart);
      }
    }

    flushCurrent();
  }

  return questions;
};

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
    sourceExcerpt: question.sourceExcerpt,
    sourceBlockId: question.sourceBlockId,
    sourceBboxJson: question.sourceBboxJson,
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
  sourceExcerpt: rawText.trim().slice(0, 1600),
  sourceBlockId: "fallback-block-1",
  sourceBboxJson: null,
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
    sourceExcerpt: [previous.sourceExcerpt, current.sourceExcerpt].filter(Boolean).join("\n\n").slice(0, 1600),
    sourceBlockId: previous.sourceBlockId,
    sourceBboxJson: previous.sourceBboxJson,
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
      sourceExcerpt: toSourceExcerpt([currentPrompt, ...firstOptions]),
      sourceBlockId: question.sourceBlockId,
      sourceBboxJson: question.sourceBboxJson,
      confidence: Math.min(question.confidence, 0.58),
      needsReview: true,
    },
    {
      ...question,
      title: `${title} - Асуулт ${nextOrder}`,
      prompt: nextPrompt,
      options: secondOptions,
      answers: [],
      sourceExcerpt: toSourceExcerpt([nextPrompt, ...secondOptions]),
      sourceBlockId: question.sourceBlockId,
      sourceBboxJson: question.sourceBboxJson,
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
  inheritedDeclaredScores: Map<number, number>,
): ParsedImportQuestion | null => {
  let currentQuestion: WorkingQuestion | null = null;
  const declaredScores = new Map(inheritedDeclaredScores);
  const sourceExcerpt = toSourceExcerpt(lines);

  for (const [index, line] of lines.entries()) {
    const declaredScoreRule = parseDeclaredScoreRule(line);
    if (declaredScoreRule) {
      for (const order of declaredScoreRule.orders) {
        declaredScores.set(order, declaredScoreRule.score);
        if (currentQuestion?.order === order) {
          currentQuestion.score = declaredScoreRule.score;
          currentQuestion.difficulty = toDifficulty(declaredScoreRule.score);
        }
      }
      continue;
    }

    const titledQuestionMatch = titledQuestionPattern.exec(line);
    if (titledQuestionMatch?.[2]) {
      const order = Number.parseInt(titledQuestionMatch[2], 10) || nextOrder;
      const score = parseInlineScore(line) ?? declaredScores.get(order) ?? 1;
      currentQuestion = {
        order,
        type: "ESSAY",
        title: `${title} - Асуулт ${order}`,
        prompt: stripBoilerplate(titledQuestionMatch[3] ?? ""),
        options: [],
        answers: [],
        score,
        difficulty: toDifficulty(score),
        sourcePage: pageNumber,
        sourceExcerpt,
        sourceBlockId: `page-${pageNumber}-legacy-block-${order}`,
        sourceBboxJson: null,
        confidence: 0.5,
        needsReview: true,
      };
      continue;
    }

    const namedQuestionMatch = namedQuestionPattern.exec(line);
    if (namedQuestionMatch?.[1]) {
      const order = Number.parseInt(namedQuestionMatch[1], 10) || nextOrder;
      const score = parseInlineScore(line) ?? declaredScores.get(order) ?? 1;
      currentQuestion = {
        order,
        type: "ESSAY",
        title: `${title} - Асуулт ${order}`,
        prompt: stripBoilerplate(namedQuestionMatch[2] ?? ""),
        options: [],
        answers: [],
        score,
        difficulty: toDifficulty(score),
        sourcePage: pageNumber,
        sourceExcerpt,
        sourceBlockId: `page-${pageNumber}-legacy-block-${order}`,
        sourceBboxJson: null,
        confidence: 0.5,
        needsReview: true,
      };
      continue;
    }

    const questionMatch = matchQuestionStart(line);
    if (questionMatch) {
      const order = questionMatch.order || nextOrder;
      const score = parseInlineScore(line) ?? declaredScores.get(order) ?? 1;
      currentQuestion = {
        order,
        type: "ESSAY",
        title: `${title} - Асуулт ${order}`,
        prompt: questionMatch.prompt,
        options: [],
        answers: [],
        score,
        difficulty: toDifficulty(score),
        sourcePage: pageNumber,
        sourceExcerpt,
        sourceBlockId: `page-${pageNumber}-legacy-block-${order}`,
        sourceBboxJson: null,
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

    const score = parseInlineScore(line);
    if (score !== null) {
      currentQuestion.score = score;
      currentQuestion.difficulty = toDifficulty(score);
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
  extractionJson?: string | null,
): ParserState => {
  const structuredDocument = parseStructuredImportDocument(extractionJson);
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
  const normalizedFallbackTitle = fallbackTitle.trim();
  const titleSource =
    (titledPrefix && preferredTitlePattern.test(titledPrefix) ? titledPrefix : null) ||
    (titleCandidate && preferredTitlePattern.test(titleCandidate) ? titleCandidate : null) ||
    (isFallbackTitleNoise(normalizedFallbackTitle) ? "PDF импорт асуултууд" : fallbackTitle);
  const title = titleSource.length ? titleSource.slice(0, 120) : "PDF импорт асуултууд";
  if (structuredDocument) {
    const structuredOlympiadQuestions = pickBestStructuredOlympiadQuestions(
      structuredDocument,
      title,
    );
    if (structuredOlympiadQuestions.length >= 4) {
        return {
          title,
          questions: structuredOlympiadQuestions,
        };
    }

    const structuredQuestions = parseQuestionsFromStructuredDocument(structuredDocument, title);
    if (structuredQuestions.length >= 4) {
      return {
        title,
        questions: structuredQuestions,
      };
    }
  }

  if (isLikelyOlympiadFormat(pages)) {
    const olympiadQuestions = parseOlympiadStyleQuestions(pages, title);
    if (olympiadQuestions.length > 0) {
      return {
        title,
        questions: olympiadQuestions,
      };
    }
  }

  const questions: ParsedImportQuestion[] = [];
  let lastAcceptedOrder = 0;
  let declaredScores = new Map<number, number>();
  for (const page of pages) {
    for (const block of page.blocks) {
      declaredScores = collectDeclaredScores(block, declaredScores);
      for (const group of splitBlockIntoQuestionGroups(block)) {
        const parsedQuestion = parseQuestionBlock(
          group,
          title,
          page.pageNumber,
          questions.length + 1,
          declaredScores,
        );
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
  }

  return {
    title,
    questions: questions.length > 0 ? questions : [createFallbackQuestion(title, rawText)],
  };
};
