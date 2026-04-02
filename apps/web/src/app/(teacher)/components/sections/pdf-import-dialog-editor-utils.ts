"use client";

import { QuestionType } from "@/graphql/generated";
import type { ImportQuestionView } from "./pdf-import-dialog-utils";

const editorOptionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
const cyrillicEditorOptionLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З"] as const;
const editorOptionLabelPattern = "[A-HАБВГДЕЁЖЗa-hабвгдеёжз]";

const toCanonicalEditorOptionLabel = (value: string) => {
  const normalized = value.trim().toUpperCase();
  const latinIndex = editorOptionLabels.indexOf(normalized as (typeof editorOptionLabels)[number]);
  if (latinIndex >= 0) {
    return editorOptionLabels[latinIndex];
  }

  const cyrillicIndex = cyrillicEditorOptionLabels.indexOf(
    normalized as (typeof cyrillicEditorOptionLabels)[number],
  );
  if (cyrillicIndex >= 0) {
    return editorOptionLabels[cyrillicIndex] ?? normalized;
  }

  return normalized;
};

const stripEditorOptionLabel = (value: string) =>
  value
    .replace(new RegExp(`^${editorOptionLabelPattern}\\s*[\\.)-]?\\s*`, "u"), "")
    .trim();

const isLikelyLeadingOptionValue = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }

  const wordCount = normalized.split(/\s+/u).length;
  return normalized.length <= 40 && wordCount <= 6;
};

const splitInlineEditorOptions = (value: string) => {
  const normalized = value.trim();
  const matches = [
    ...normalized.matchAll(new RegExp(`(${editorOptionLabelPattern})\\s*[\\.)-]\\s*`, "gu")),
  ];
  if (matches.length === 0) {
    return [];
  }

  const segments = matches.map((match, index) => {
    const label = toCanonicalEditorOptionLabel(match[1] ?? "");
    const labelStart = match.index ?? 0;
    const start = labelStart + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1]?.index ?? normalized.length) : normalized.length;
    return {
      label,
      value: normalized.slice(start, end).trim(),
      labelStart,
    };
  });

  const leadingValue = normalized.slice(0, segments[0]?.labelStart ?? 0).trim();
  const shouldInjectLeadingOption =
    segments.length >= 2 &&
    segments[0]?.label !== "A" &&
    isLikelyLeadingOptionValue(leadingValue);

  return [
    ...(shouldInjectLeadingOption ? [leadingValue] : []),
    ...segments.map((segment) => segment.value),
  ].map(stripEditorOptionLabel).filter(Boolean);
};

export const normalizeImportQuestionOptions = (options: string[]) => {
  const strippedOptions = options.map(stripEditorOptionLabel).filter(Boolean);
  if (strippedOptions.length !== 1) {
    return strippedOptions;
  }

  const inlineOptions = splitInlineEditorOptions(strippedOptions[0] ?? "");
  return inlineOptions.length >= 2 ? inlineOptions : strippedOptions;
};

export const formatImportOptionsEditorValue = (options: string[]) =>
  normalizeImportQuestionOptions(options)
    .map((option, index) => `${editorOptionLabels[index] ?? `${index + 1}`}. ${option}`)
    .join("\n");

export const parseImportOptionsEditorValue = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return [];
  }

  const inlineOptions = splitInlineEditorOptions(normalized);
  if (inlineOptions.length >= 2) {
    return inlineOptions;
  }

  return normalized
    .split(/\n|;/u)
    .map(stripEditorOptionLabel)
    .filter(Boolean);
};

export const splitImportAnswerEditorValue = (value: string) =>
  value
    .split(/\n|;/u)
    .map((item) => item.trim())
    .filter(Boolean);

export const getImportAnswerHelperText = (question: ImportQuestionView) => {
  if (question.type === QuestionType.Mcq) {
    return "Ж: A эсвэл 70 гэж бичиж болно. Олон зөв хариу байвал шинэ мөр эсвэл `;` ашиглана.";
  }
  if (question.type === QuestionType.TrueFalse) {
    return "Ж: True, False, Үнэн, Худал.";
  }
  if (question.type === QuestionType.ShortAnswer) {
    return "Ж: 20 эсвэл 1/2. Олон зөв хариу байвал шинэ мөр эсвэл `;` ашиглана.";
  }
  return "Шалгахдаа баримжаалах жишиг хариуг энд бичнэ.";
};

export const getImportAnswerPlaceholder = (question: ImportQuestionView) => {
  if (question.type === QuestionType.Mcq) {
    return "Ж: A эсвэл 70";
  }
  if (question.type === QuestionType.TrueFalse) {
    return "Ж: True";
  }
  if (question.type === QuestionType.ShortAnswer) {
    return "Ж: 20";
  }
  return "Жишиг хариу...";
};
