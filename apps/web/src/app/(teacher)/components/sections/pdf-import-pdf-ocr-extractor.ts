"use client";

import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import {
  type OcrLineLike,
  normalizeBlock,
} from "./pdf-import-text-layout";
import {
  buildPdfImportPage,
  buildPdfImportStructuredDocument,
  type PdfImportStructuredDocument,
} from "./pdf-import-normalized-document";

const OCR_PAGE_SCALE = 2;
const OCR_LINE_Y_TOLERANCE = 8;

const renderPdfPageToCanvas = async (pdf: PDFDocumentProxy, pageNumber: number) => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: OCR_PAGE_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("PDF хуудсыг OCR-д бэлтгэх canvas үүсгэж чадсангүй.");
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
};

export const extractPdfTextWithOcr = async (pdf: PDFDocumentProxy): Promise<PdfImportStructuredDocument> => {
  const tesseract = await import("tesseract.js");
  const worker = await tesseract.createWorker(["eng", "rus"]);
  const pages = [];

  try {
    await worker.setParameters({
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: tesseract.PSM.AUTO,
    });

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const canvas = await renderPdfPageToCanvas(pdf, pageNumber);
      const result = await worker.recognize(canvas, { rotateAuto: true });
      const ocrData = result.data as { lines?: OcrLineLike[]; text?: string };
      const lines = Array.isArray(ocrData.lines)
        ? ocrData.lines.map((line: OcrLineLike) => ({
            x: line.bbox?.x0 ?? 0,
            y: line.bbox?.y0 ?? 0,
            width: Math.max(0, (line.bbox?.x1 ?? 0) - (line.bbox?.x0 ?? 0)),
            height: 14,
            text: line.text ?? "",
            confidence: null,
          }))
        : [];
      pages.push(
        lines.length > 0
          ? buildPdfImportPage({
              pageNumber,
              pageWidth: canvas.width,
              pageHeight: canvas.height,
              segments: lines,
              lineTolerance: OCR_LINE_Y_TOLERANCE,
              sourceEngine: "browser-ocr",
            })
          : {
              number: pageNumber,
              width: canvas.width,
              height: canvas.height,
              layout: "single-column" as const,
              blocks: [
                {
                  id: `page-${pageNumber}-block-1`,
                  pageNumber,
                  type: "text" as const,
                  columnIndex: 0 as const,
                  bbox: { x: 0, y: 0, width: canvas.width, height: canvas.height },
                  text: normalizeBlock(ocrData.text ?? ""),
                  lines: [],
                  sourceEngine: "browser-ocr",
                },
              ],
              text: normalizeBlock(ocrData.text ?? ""),
            },
      );
    }
  } finally {
    await worker.terminate();
  }

  return buildPdfImportStructuredDocument(pages, ["browser-ocr"]);
};
