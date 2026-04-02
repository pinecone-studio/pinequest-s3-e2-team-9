"use client";

import {
  buildPdfImportPage,
  buildPdfImportStructuredDocument,
  type PdfImportStructuredDocument,
} from "./pdf-import-normalized-document";
import { normalizeBlock, type OcrLineLike } from "./pdf-import-text-layout";

const OCR_LINE_Y_TOLERANCE = 8;

const loadImageElement = async (file: File) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Зургийг preview-д бэлтгэж чадсангүй."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const extractImageTextWithOcr = async (file: File): Promise<PdfImportStructuredDocument> => {
  const tesseract = await import("tesseract.js");
  const worker = await tesseract.createWorker(["eng", "rus"]);

  try {
    await worker.setParameters({
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: tesseract.PSM.AUTO,
    });

    const image = await loadImageElement(file);
    const result = await worker.recognize(file, { rotateAuto: true });
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
    const pages = [
      lines.length > 0
        ? buildPdfImportPage({
            pageNumber: 1,
            pageWidth: image.width,
            pageHeight: image.height,
            segments: lines,
            lineTolerance: OCR_LINE_Y_TOLERANCE,
            sourceEngine: "browser-ocr",
          })
        : {
            number: 1,
            width: image.width,
            height: image.height,
            layout: "single-column" as const,
            blocks: [
              {
                id: "page-1-block-1",
                pageNumber: 1,
                type: "text" as const,
                columnIndex: 0 as const,
                bbox: { x: 0, y: 0, width: image.width, height: image.height },
                text: normalizeBlock(ocrData.text ?? ""),
                lines: [],
                sourceEngine: "browser-ocr",
              },
            ],
            text: normalizeBlock(ocrData.text ?? ""),
          },
    ];

    return buildPdfImportStructuredDocument(pages, ["browser-ocr"]);
  } finally {
    await worker.terminate();
  }
};
