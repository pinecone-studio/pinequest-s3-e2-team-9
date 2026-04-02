"use client";

import { ExamImportSourceType } from "@/graphql/generated";
import type { PdfImportExtractionResult } from "./pdf-import-text-extractor";

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
]);
const SUPPORTED_IMAGE_EXTENSIONS = /\.(?:jpe?g|png|webp|gif|bmp)$/i;
const PDF_EXTENSION = /\.pdf$/i;

export type PdfImportServiceResult = PdfImportExtractionResult & {
  provider: "api" | "client";
};

export type PdfImportUploadResult = {
  key: string;
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
};

export type GetToken = () => Promise<string | null>;

type ExtractionApiPayload = PdfImportServiceResult;
type UploadApiPayload = PdfImportUploadResult;

const isExtractionApiPayload = (value: unknown): value is ExtractionApiPayload =>
  typeof value === "object" &&
  value !== null &&
  "extractedText" in value &&
  typeof value.extractedText === "string" &&
  "strategy" in value &&
  typeof value.strategy === "string" &&
  "provider" in value &&
  typeof value.provider === "string";

const isUploadApiPayload = (value: unknown): value is UploadApiPayload =>
  typeof value === "object" &&
  value !== null &&
  "key" in value &&
  typeof value.key === "string" &&
  "fileName" in value &&
  typeof value.fileName === "string" &&
  "fileSizeBytes" in value &&
  typeof value.fileSizeBytes === "number" &&
  "contentType" in value &&
  typeof value.contentType === "string";

export class PdfImportExtractionError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PdfImportExtractionError";
    this.status = status;
  }
}

export class PdfImportUploadError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PdfImportUploadError";
    this.status = status;
  }
}

export const parseExtractionApiResponse = async (
  response: Response,
): Promise<PdfImportServiceResult> => {
  const rawText = await response.text().catch(() => "");
  const payload = (() => {
    if (!rawText) {
      return null;
    }

    try {
      return JSON.parse(rawText) as { error?: string } | ExtractionApiPayload;
    } catch {
      return null;
    }
  })() as { error?: string } | ExtractionApiPayload | null;
  const errorPayload = payload as { error?: string } | null;

  if (!response.ok) {
    throw new PdfImportExtractionError(
      response.status,
      typeof errorPayload?.error === "string"
        ? errorPayload.error
        : rawText.trim() || `PDF extraction request failed with status ${response.status}.`,
    );
  }

  if (!isExtractionApiPayload(payload)) {
    throw new PdfImportExtractionError(502, "PDF extraction API invalid response returned.");
  }

  return payload;
};

export const parseUploadApiResponse = async (
  response: Response,
): Promise<PdfImportUploadResult> => {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | UploadApiPayload
    | null;
  const errorPayload = payload as { error?: string } | null;

  if (!response.ok) {
    throw new PdfImportUploadError(
      response.status,
      typeof errorPayload?.error === "string"
        ? errorPayload.error
        : "PDF upload request failed.",
    );
  }

  if (!isUploadApiPayload(payload)) {
    throw new PdfImportUploadError(502, "PDF upload API invalid response returned.");
  }

  return payload;
};

export const canRetryWithoutStoredFile = (error: unknown) =>
  error instanceof PdfImportExtractionError &&
  [400, 401, 403, 404].includes(error.status);

export const canFallbackWithoutStoredUpload = (error: unknown) =>
  error instanceof PdfImportUploadError &&
  (error.status === 501 || error.status === 502 || error.status === 503);

export const canFallbackToClient = (error: unknown) =>
  error instanceof PdfImportExtractionError;

export const isPdfImportFile = (file: File) =>
  file.type.trim().toLowerCase() === "application/pdf" || PDF_EXTENSION.test(file.name);

export const isImageImportFile = (file: File) =>
  SUPPORTED_IMAGE_MIME_TYPES.has(file.type.trim().toLowerCase()) ||
  SUPPORTED_IMAGE_EXTENSIONS.test(file.name);

export const isSupportedImportFile = (file: File) =>
  isPdfImportFile(file) || isImageImportFile(file);

export const getImportSourceType = (file: File): ExamImportSourceType =>
  isImageImportFile(file) ? ExamImportSourceType.Image : ExamImportSourceType.Pdf;
