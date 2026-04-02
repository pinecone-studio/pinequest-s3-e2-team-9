"use client";

import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { extractImageTextWithOcr } from "./pdf-import-image-extractor";
import { extractPdfTextWithOcr } from "./pdf-import-pdf-ocr-extractor";
import { type TextItemLike } from "./pdf-import-text-layout";
import {
  buildPdfImportPage,
  buildPdfImportStructuredDocument,
  type PdfImportClassifier,
  type PdfImportStructuredDocument,
} from "./pdf-import-normalized-document";

export type PdfImportExtractionResult = {
  extractedText: string;
  strategy: "text-layer" | "browser-ocr";
  document?: PdfImportStructuredDocument;
  classification?: PdfImportClassifier;
};

const LINE_Y_TOLERANCE = 4;

const extractPage = async (pdf: PDFDocumentProxy, pageNumber: number) => {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  const segments = (content.items as TextItemLike[]).map((item) => ({
    x: Array.isArray(item.transform) ? item.transform[4] ?? 0 : 0,
    y: Array.isArray(item.transform) ? item.transform[5] ?? 0 : 0,
    width: item.width ?? 0,
    height: Array.isArray(item.transform) ? Math.abs(item.transform[0] ?? 12) : 12,
    text: item.str ?? "",
  }));
  return buildPdfImportPage({
    pageNumber,
    pageWidth: viewport.width,
    pageHeight: viewport.height,
    segments,
    lineTolerance: LINE_Y_TOLERANCE,
    sourceEngine: "pdfjs-text",
  });
};

export const extractPdfText = async (file: File): Promise<PdfImportExtractionResult> => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const buffer = await file.arrayBuffer();
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();
  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  });
  const pdf = await task.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await extractPage(pdf, pageNumber);
    if (page.text) {
      pages.push(page);
    }
  }

  if (pages.length > 0) {
    const document = buildPdfImportStructuredDocument(pages, ["pdfjs-text"]);
    return {
      extractedText: document.fullText,
      strategy: "text-layer",
      document,
      classification: document.classifier,
    };
  }

  const ocrDocument = await extractPdfTextWithOcr(pdf);
  if (!ocrDocument.fullText) {
    throw new Error("PDF файлаас text эсвэл OCR үр дүн гарсангүй.");
  }

  return {
    extractedText: ocrDocument.fullText,
    strategy: "browser-ocr",
    document: ocrDocument,
    classification: ocrDocument.classifier,
  };
};

export const extractDocumentText = async (file: File): Promise<PdfImportExtractionResult> => {
  if (file.type.trim().toLowerCase() === "application/pdf" || /\.pdf$/i.test(file.name)) {
    return extractPdfText(file);
  }

  const ocrDocument = await extractImageTextWithOcr(file);
  if (!ocrDocument.fullText) {
    throw new Error("Зургаас OCR text гарсангүй.");
  }

  return {
    extractedText: ocrDocument.fullText,
    strategy: "browser-ocr",
    document: ocrDocument,
    classification: ocrDocument.classifier,
  };
};
