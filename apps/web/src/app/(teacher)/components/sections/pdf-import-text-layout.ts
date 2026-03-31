"use client";

export type TextItemLike = {
  str?: string;
  transform?: number[];
};

export type PositionedTextSegment = {
  x: number;
  y: number;
  text: string;
};

export type OcrLineLike = {
  text?: string;
  bbox?: {
    x0?: number;
    y0?: number;
  };
};

const BLOCK_Y_GAP = 18;
const CHUNK_X_GAP = 32;

const normalizeLine = (value: string) =>
  value.replace(/[ \t]+/g, " ").trim();

export const normalizeBlock = (value: string) =>
  value
    .replace(/\u00A0/gu, " ")
    .split(/\r?\n/u)
    .map((line) => (line.trim() ? normalizeLine(line) : ""))
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();

export const buildStructuredPageText = (
  segments: PositionedTextSegment[],
  pageWidth: number,
  lineTolerance: number,
  readingOrder: "bottom-up" | "top-down",
) => {
  const rows: Array<{ y: number; parts: Array<{ x: number; text: string }> }> = [];

  for (const item of segments) {
    const text = normalizeLine(item.text);
    if (!text) {
      continue;
    }

    const existingRow = rows.find((row) => Math.abs(row.y - item.y) <= lineTolerance);
    if (existingRow) {
      existingRow.parts.push({ x: item.x, text });
      continue;
    }

    rows.push({ y: item.y, parts: [{ x: item.x, text }] });
  }

  const sortedRows = rows.sort((left, right) =>
    readingOrder === "bottom-up" ? right.y - left.y : left.y - right.y,
  );
  const lines: string[] = [];
  let previousRowY: number | null = null;

  for (const row of sortedRows) {
    if (previousRowY !== null && Math.abs(row.y - previousRowY) > BLOCK_Y_GAP) {
      lines.push("");
    }

    const chunks: Array<{ x: number; text: string; lastX: number }> = [];
    for (const part of row.parts.sort((left, right) => left.x - right.x)) {
      const currentChunk = chunks[chunks.length - 1];
      if (!currentChunk) {
        chunks.push({ x: part.x, text: part.text, lastX: part.x });
        continue;
      }

      if (part.x - currentChunk.lastX > Math.max(CHUNK_X_GAP, pageWidth * 0.12)) {
        chunks.push({ x: part.x, text: part.text, lastX: part.x });
        continue;
      }

      currentChunk.text = normalizeLine(`${currentChunk.text} ${part.text}`);
      currentChunk.lastX = part.x;
    }

    lines.push(
      chunks
        .map((chunk) => normalizeLine(chunk.text))
        .filter(Boolean)
        .join(" || "),
    );
    previousRowY = row.y;
  }

  return normalizeBlock(lines.join("\n"));
};
