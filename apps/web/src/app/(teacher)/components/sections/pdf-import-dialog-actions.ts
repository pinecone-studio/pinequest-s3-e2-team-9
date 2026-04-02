"use client";

import type {
  CreateExamImportJobMutationMutation,
  CreateExamImportJobMutationMutationVariables,
} from "@/graphql/generated";
import { extractDocumentText } from "./pdf-import-text-extractor";
import {
  extractPdfImportContent,
  uploadPdfImportFile,
} from "./pdf-import-extraction-service";
import {
  canFallbackWithoutStoredUpload,
  getImportSourceType,
  type GetToken,
} from "./pdf-import-extraction-service-helpers";

type CreateImportJobFn = (options: { variables: CreateExamImportJobMutationMutationVariables }) => Promise<{ data?: CreateExamImportJobMutationMutation | null }>;

export const getPdfImportErrorMessage = (error: unknown): string => {
  const extractJsonErrorMessage = (value: unknown): string | null => {
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as { error?: unknown; errors?: Array<{ message?: unknown }> };

      if (typeof parsed.error === "string" && parsed.error.trim()) {
        return parsed.error.trim();
      }

      if (typeof parsed.errors?.[0]?.message === "string" && parsed.errors[0].message.trim()) {
        return parsed.errors[0].message.trim();
      }
    } catch {
      return null;
    }

    return null;
  };

  const extractErrorMessage = (value: unknown): string | null => {
    if (!value || typeof value !== "object") {
      return null;
    }

    const candidate = value as { message?: unknown; error?: unknown; bodyText?: unknown; errors?: Array<{ message?: unknown }>; graphQLErrors?: Array<{ message?: unknown }>; result?: { errors?: Array<{ message?: unknown }> }; networkError?: unknown; cause?: unknown };

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error.trim();
    }

    if (typeof candidate.errors?.[0]?.message === "string" && candidate.errors[0].message.trim()) {
      return candidate.errors[0].message.trim();
    }

    if (
      typeof candidate.graphQLErrors?.[0]?.message === "string" &&
      candidate.graphQLErrors[0].message.trim()
    ) {
      return candidate.graphQLErrors[0].message.trim();
    }

    if (
      typeof candidate.result?.errors?.[0]?.message === "string" &&
      candidate.result.errors[0].message.trim()
    ) {
      return candidate.result.errors[0].message.trim();
    }

    const parsedBodyMessage = extractJsonErrorMessage(candidate.bodyText);
    if (parsedBodyMessage) {
      return parsedBodyMessage;
    }

    const nestedMessage =
      extractErrorMessage(candidate.networkError) ?? extractErrorMessage(candidate.cause);
    if (nestedMessage) {
      return nestedMessage;
    }

    if (
      typeof candidate.message === "string" &&
      candidate.message &&
      !candidate.message.includes("Received status code 400")
    ) {
      return candidate.message;
    }

    return null;
  };

  const extractedMessage = extractErrorMessage(error);
  if (extractedMessage) {
    return extractedMessage;
  }

  if (
    error instanceof Error &&
    error.message &&
    !error.message.includes("Received status code 400")
  ) {
    return error.message;
  }

  return "Импорт бэлтгэх үед алдаа гарлаа.";
};

export const createPdfImportDraft = async ({
  selectedFile,
  getToken,
  createImportJob,
}: {
  selectedFile: File;
  getToken: GetToken;
  createImportJob: CreateImportJobFn;
}) => {
  let storageKey: string | null = null;
  let storageWarning: string | null = null;

  try {
    const uploadedPdf = await uploadPdfImportFile(selectedFile, getToken);
    storageKey = uploadedPdf.key;
  } catch (error) {
    if (!canFallbackWithoutStoredUpload(error)) {
      throw error;
    }

    storageWarning =
      "Temporary file storage is unavailable, so this import will continue without a persisted source file.";
  }

  const extraction = await extractPdfImportContent(selectedFile, getToken, storageKey);
  const structuredFallback =
    extraction.document && extraction.classification ? undefined : await extractDocumentText(selectedFile);
  const document = extraction.document ?? structuredFallback?.document;
  const classification = extraction.classification ?? structuredFallback?.classification;
  const extractedText = extraction.extractedText;
  if (!extractedText.trim()) {
    throw new Error("Файлаас уншигдах text олдсонгүй.");
  }

  const result = await createImportJob({
    variables: {
      fileName: selectedFile.name,
      fileSizeBytes: selectedFile.size,
      extractedText,
      sourceType: getImportSourceType(selectedFile),
      storageKey,
      extractionJson: document ? JSON.stringify(document) : null,
      classifierJson: classification ? JSON.stringify(classification) : null,
    },
  });
  const nextJob = result.data?.createExamImportJob;
  if (!nextJob) {
    throw new Error("Import job үүсгэсэн мэдээлэл ирсэнгүй.");
  }

  const extractionMessage =
    extraction.strategy === "browser-ocr"
      ? extraction.provider === "api"
        ? "Scan document илэрсэн тул extraction service OCR ашиглаж уншлаа. Хэрэв зарим текст зөрүүтэй бол review дээр засаад хадгална уу."
        : "Scan document илэрсэн тул browser OCR ашиглаж уншлаа. Хэрэв зарим текст зөрүүтэй бол review дээр засаад хадгална уу."
      : extraction.provider === "api"
        ? storageKey
          ? "Файлыг түр хадгалаад extraction API ашиглан text-ийг уншлаа."
          : "Extraction API ашиглан файлын text-ийг уншлаа."
        : null;
  const engineMessage =
    classification?.enginesUsed?.length
      ? `Extraction engine: ${classification.enginesUsed.join(", ")}.`
      : null;

  return {
    job: nextJob,
    infoMessage: [storageWarning, extractionMessage, engineMessage].filter(Boolean).join(" ") || null,
  };
};
