"use client";

import { getApiBaseUrl } from "@/lib/graphql-endpoint";
import { extractDocumentText } from "./pdf-import-text-extractor";
import {
  canFallbackToClient,
  canRetryWithoutStoredFile,
  type GetToken,
  parseExtractionApiResponse,
  parseUploadApiResponse,
  PdfImportExtractionError,
  type PdfImportServiceResult,
  type PdfImportUploadResult,
  PdfImportUploadError,
} from "./pdf-import-extraction-service-helpers";

type ExtractionApiPayload = PdfImportServiceResult;

const extractViaApi = async (
  file: File,
  getToken: GetToken,
  storageKey?: string | null,
): Promise<ExtractionApiPayload> => {
  const token = await getToken();
  if (!token) {
    throw new PdfImportExtractionError(401, "Authentication required.");
  }

  const response = storageKey
    ? await fetch(`${getApiBaseUrl()}/imports/pdf/extract`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ storageKey }),
      })
    : await fetch(`${getApiBaseUrl()}/imports/pdf/extract`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.set("file", file, file.name);
          return formData;
        })(),
      });

  return parseExtractionApiResponse(response);
};

export const uploadPdfImportFile = async (
  file: File,
  getToken: GetToken,
): Promise<PdfImportUploadResult> => {
  const token = await getToken();
  if (!token) {
    throw new PdfImportUploadError(401, "Authentication required.");
  }

  const formData = new FormData();
  formData.set("file", file, file.name);

  const response = await fetch(`${getApiBaseUrl()}/uploads/pdf-import`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseUploadApiResponse(response);
};

export const extractPdfImportContent = async (
  file: File,
  getToken: GetToken,
  storageKey?: string | null,
): Promise<PdfImportServiceResult> => {
  try {
    if (storageKey) {
      try {
        return await extractViaApi(file, getToken, storageKey);
      } catch (error) {
        if (!canRetryWithoutStoredFile(error)) {
          throw error;
        }
      }
    }

    return await extractViaApi(file, getToken);
  } catch (error) {
    if (!canFallbackToClient(error)) {
      throw error;
    }

    const result = await extractDocumentText(file);
    return {
      ...result,
      provider: "client",
    };
  }
};
