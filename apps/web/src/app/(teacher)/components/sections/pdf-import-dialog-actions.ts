"use client";

import type {
  CreateExamImportJobMutationMutation,
  CreateExamImportJobMutationMutationVariables,
} from "@/graphql/generated";
import {
  extractPdfImportContent,
  uploadPdfImportFile,
} from "./pdf-import-extraction-service";
import {
  canFallbackWithoutStoredUpload,
  type GetToken,
} from "./pdf-import-extraction-service-helpers";

type CreateImportJobFn = (options: {
  variables: CreateExamImportJobMutationMutationVariables;
}) => Promise<{ data?: CreateExamImportJobMutationMutation | null }>;

export const getPdfImportErrorMessage = (error: unknown): string => {
  if (
    error instanceof Error &&
    error.message &&
    !error.message.includes("Received status code 400")
  ) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: unknown;
      bodyText?: unknown;
      result?: { errors?: Array<{ message?: unknown }> };
      cause?: {
        message?: unknown;
        bodyText?: unknown;
        result?: { errors?: Array<{ message?: unknown }> };
      };
    };

    const graphQlMessage =
      typeof candidate.result?.errors?.[0]?.message === "string"
        ? candidate.result.errors[0].message
        : typeof candidate.cause?.result?.errors?.[0]?.message === "string"
          ? candidate.cause.result.errors[0].message
          : null;
    if (graphQlMessage) {
      return graphQlMessage;
    }

    if (typeof candidate.bodyText === "string" && candidate.bodyText.trim()) {
      return candidate.bodyText.trim();
    }

    if (typeof candidate.cause?.bodyText === "string" && candidate.cause.bodyText.trim()) {
      return candidate.cause.bodyText.trim();
    }

    if (typeof candidate.message === "string" && candidate.message) {
      return candidate.message;
    }
  }

  return "PDF импорт бэлтгэх үед алдаа гарлаа.";
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
      "Temporary PDF storage is unavailable, so this import will continue without a persisted source file.";
  }

  const extraction = await extractPdfImportContent(selectedFile, getToken, storageKey);
  const extractedText = extraction.extractedText;
  if (!extractedText.trim()) {
    throw new Error("PDF файлаас selectable text олдсонгүй.");
  }

  const result = await createImportJob({
    variables: {
      fileName: selectedFile.name,
      fileSizeBytes: selectedFile.size,
      extractedText,
      storageKey,
    },
  });
  const nextJob = result.data?.createExamImportJob;
  if (!nextJob) {
    throw new Error("PDF import job үүсгэсэн мэдээлэл ирсэнгүй.");
  }

  const extractionMessage =
    extraction.strategy === "browser-ocr"
      ? extraction.provider === "api"
        ? "Scan PDF илэрсэн тул extraction service OCR ашиглаж уншлаа. Хэрэв зарим текст зөрүүтэй бол review дээр засаад хадгална уу."
        : "Scan PDF илэрсэн тул browser OCR ашиглаж уншлаа. Хэрэв зарим текст зөрүүтэй бол review дээр засаад хадгална уу."
      : extraction.provider === "api"
        ? storageKey
          ? "PDF-г түр хадгалаад extraction API ашиглан файлын text-ийг уншлаа."
          : "PDF extraction API ашиглан файлын text-ийг уншлаа."
        : null;

  return {
    job: nextJob,
    infoMessage: [storageWarning, extractionMessage].filter(Boolean).join(" ") || null,
  };
};
