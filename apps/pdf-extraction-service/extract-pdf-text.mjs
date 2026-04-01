import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const LINE_Y_TOLERANCE = 4;
const BLOCK_Y_GAP = 18;
const CHUNK_X_GAP = 32;

const normalizeLine = (value) => value.replace(/[ \t]+/g, " ").trim();

const normalizeBlock = (value) =>
  value
    .split(/\r?\n/u)
    .map((line) => (line.trim() ? normalizeLine(line) : ""))
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();

const extractStructuredPageText = (items, pageWidth) => {
  const rows = [];

  for (const item of items) {
    const text = normalizeLine("str" in item ? item.str ?? "" : "");
    if (!text) {
      continue;
    }

    const x = Array.isArray(item.transform) ? item.transform[4] ?? 0 : 0;
    const y = Array.isArray(item.transform) ? item.transform[5] ?? 0 : 0;
    const existingRow = rows.find((row) => Math.abs(row.y - y) <= LINE_Y_TOLERANCE);

    if (existingRow) {
      existingRow.parts.push({ x, text });
    } else {
      rows.push({ y, parts: [{ x, text }] });
    }
  }

  const lines = [];
  let previousRowY = null;

  for (const row of rows.sort((left, right) => right.y - left.y)) {
    if (previousRowY !== null && Math.abs(previousRowY - row.y) > BLOCK_Y_GAP) {
      lines.push("");
    }

    const parts = row.parts.sort((left, right) => left.x - right.x);
    const chunks = [];

    for (const part of parts) {
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

export async function extractPdfTextFromBuffer(buffer) {
  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  });

  const pdf = await task.promise;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const text = extractStructuredPageText(content.items, viewport.width);

      if (text) {
        pages.push(`Page ${pageNumber}`);
        pages.push(text);
      }
    }
  } finally {
    await pdf.destroy();
  }

  return pages.join("\n").trim();
}
