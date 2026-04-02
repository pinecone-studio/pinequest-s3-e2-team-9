from __future__ import annotations

import io
import json
import re
from dataclasses import dataclass
from typing import Any

from config import AZURE_ENDPOINT, AZURE_KEY, AZURE_MODEL, TESSERACT_LANGUAGES

try:
    import fitz  # type: ignore
except ImportError:  # pragma: no cover
    fitz = None

try:
    import pdfplumber  # type: ignore
except ImportError:  # pragma: no cover
    pdfplumber = None

try:
    import pytesseract  # type: ignore
except ImportError:  # pragma: no cover
    pytesseract = None

try:
    from PIL import Image  # type: ignore
except ImportError:  # pragma: no cover
    Image = None

try:
    from azure.ai.documentintelligence import DocumentIntelligenceClient  # type: ignore
    from azure.core.credentials import AzureKeyCredential  # type: ignore
except ImportError:  # pragma: no cover
    DocumentIntelligenceClient = None
    AzureKeyCredential = None


@dataclass
class ExtractionArtifact:
    full_text: str
    document: dict[str, Any]
    strategy: str
    engines_used: list[str]


def normalize_text(value: str) -> str:
    return re.sub(r"[ \t]+", " ", value).strip()


def normalize_multiline(value: str) -> str:
    lines = [normalize_text(line) if line.strip() else "" for line in value.splitlines()]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()


def build_classifier(document: dict[str, Any], engines_used: list[str], needs_ocr: bool) -> dict[str, Any]:
    pages = document.get("pages", [])
    layouts = {page.get("layout", "single-column") for page in pages}
    table_count = sum(
        1
        for page in pages
        for block in page.get("blocks", [])
        if block.get("type") == "table"
    )
    return {
        "documentKind": "scan" if needs_ocr else ("mixed" if any("ocr" in engine for engine in engines_used) else "text"),
        "layout": next(iter(layouts)) if len(layouts) == 1 else "mixed",
        "tableHeavy": table_count >= max(2, len(pages) // 2 or 1),
        "needsOcr": needs_ocr,
        "recommendedEngine": "ocr" if needs_ocr else ("hybrid" if table_count > 0 else "text-layer"),
        "enginesUsed": engines_used,
    }


def detect_block_type(text: str, line_count: int) -> str:
    if re.search(r"^\d+\s*[–-]\s*\d+\s*р\s+бодлого", text, re.IGNORECASE):
        return "section"
    if re.search(r"^\d{1,3}\s*[\.\)]", text):
        return "question"
    if re.search(r"^[A-HАБВГДЕЁЖЗa-hабвгдеёжз]\s*[\.)-]", text):
        return "options"
    if line_count >= 2 and len(text.split()) <= line_count * 4:
        return "table"
    if re.search(r"(олимпиад|шалгалт|тест|хугацаа)", text, re.IGNORECASE):
        return "header"
    return "text"


def build_document_from_pages(pages: list[dict[str, Any]], engines_used: list[str], needs_ocr: bool) -> dict[str, Any]:
    full_text = "\n\n".join(
        f"Page {page['number']}\n{page['text']}".strip() for page in pages if page.get("text")
    ).strip()
    return {
        "pages": pages,
        "fullText": full_text,
        "classifier": build_classifier({"pages": pages}, engines_used, needs_ocr),
    }


def extract_with_pymupdf(buffer: bytes) -> ExtractionArtifact | None:
    if fitz is None:
        return None

    doc = fitz.open(stream=buffer, filetype="pdf")
    pages: list[dict[str, Any]] = []
    try:
        for page_index, page in enumerate(doc, start=1):
            lines: list[dict[str, Any]] = []
            text_dict = page.get_text("dict", sort=True)
            blocks = text_dict.get("blocks", [])
            for block in blocks:
                for line in block.get("lines", []):
                    spans = line.get("spans", [])
                    text = normalize_text(" ".join(span.get("text", "") for span in spans))
                    if not text:
                        continue
                    bbox = line.get("bbox", [0, 0, 0, 0])
                    lines.append(
                        {
                            "id": f"page-{page_index}-line-{len(lines) + 1}",
                            "text": text,
                            "bbox": {
                                "x": bbox[0],
                                "y": bbox[1],
                                "width": max(0, bbox[2] - bbox[0]),
                                "height": max(0, bbox[3] - bbox[1]),
                            },
                            "tokens": [],
                        }
                    )

            line_texts = [line["text"] for line in lines]
            page_text = normalize_multiline("\n".join(line_texts))
            page_blocks = []
            if lines:
                combined_bbox = {
                    "x": min(line["bbox"]["x"] for line in lines),
                    "y": min(line["bbox"]["y"] for line in lines),
                    "width": page.rect.width,
                    "height": page.rect.height,
                }
                page_blocks.append(
                    {
                        "id": f"page-{page_index}-block-1",
                        "pageNumber": page_index,
                        "type": detect_block_type(page_text.splitlines()[0] if page_text else "", len(lines)),
                        "columnIndex": 0,
                        "bbox": combined_bbox,
                        "text": page_text,
                        "lines": lines,
                        "sourceEngine": "pymupdf",
                    }
                )

            pages.append(
                {
                    "number": page_index,
                    "width": float(page.rect.width),
                    "height": float(page.rect.height),
                    "layout": "single-column",
                    "blocks": page_blocks,
                    "text": page_text,
                }
            )
    finally:
        doc.close()

    document = build_document_from_pages(pages, ["pymupdf"], needs_ocr=False)
    if not document["fullText"]:
        return None
    return ExtractionArtifact(document["fullText"], document, "text-layer", ["pymupdf"])


def enrich_with_pdfplumber(buffer: bytes, artifact: ExtractionArtifact) -> ExtractionArtifact:
    if pdfplumber is None:
        return artifact

    with pdfplumber.open(io.BytesIO(buffer)) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            tables = page.find_tables()
            if not tables:
                continue
            document_page = artifact.document["pages"][page_index - 1]
            for table_index, table in enumerate(tables, start=1):
                rows = table.extract()
                text = normalize_multiline(
                    "\n".join(" | ".join(cell or "" for cell in row) for row in rows if row)
                )
                if not text:
                    continue
                bbox = table.bbox or (0, 0, page.width, page.height)
                document_page["blocks"].append(
                    {
                        "id": f"page-{page_index}-table-{table_index}",
                        "pageNumber": page_index,
                        "type": "table",
                        "columnIndex": 0,
                        "bbox": {
                            "x": bbox[0],
                            "y": bbox[1],
                            "width": max(0, bbox[2] - bbox[0]),
                            "height": max(0, bbox[3] - bbox[1]),
                        },
                        "text": text,
                        "lines": [],
                        "sourceEngine": "pdfplumber",
                    }
                )
        artifact.document["classifier"] = build_classifier(
            artifact.document, [*artifact.engines_used, "pdfplumber"], needs_ocr=False
        )
        artifact.engines_used.append("pdfplumber")
        return artifact


def extract_with_azure(buffer: bytes) -> ExtractionArtifact | None:
    if not AZURE_ENDPOINT or not AZURE_KEY or DocumentIntelligenceClient is None or AzureKeyCredential is None:
        return None

    client = DocumentIntelligenceClient(AZURE_ENDPOINT, AzureKeyCredential(AZURE_KEY))
    poller = client.begin_analyze_document(AZURE_MODEL, body=buffer)
    result = poller.result()

    pages: list[dict[str, Any]] = []
    for page_index, page in enumerate(result.pages, start=1):
        line_items = []
        for line_index, line in enumerate(page.lines or [], start=1):
            polygon = getattr(line, "polygon", None) or []
            xs = polygon[0::2] or [0]
            ys = polygon[1::2] or [0]
            bbox = {
                "x": min(xs),
                "y": min(ys),
                "width": max(xs) - min(xs),
                "height": max(ys) - min(ys),
            }
            line_items.append(
                {
                    "id": f"page-{page_index}-line-{line_index}",
                    "text": normalize_text(line.content or ""),
                    "bbox": bbox,
                    "tokens": [],
                }
            )

        page_text = normalize_multiline("\n".join(item["text"] for item in line_items))
        pages.append(
            {
                "number": page_index,
                "width": float(page.width or 0),
                "height": float(page.height or 0),
                "layout": "single-column",
                "blocks": [
                    {
                        "id": f"page-{page_index}-block-1",
                        "pageNumber": page_index,
                        "type": detect_block_type(page_text.splitlines()[0] if page_text else "", len(line_items)),
                        "columnIndex": 0,
                        "bbox": {"x": 0, "y": 0, "width": float(page.width or 0), "height": float(page.height or 0)},
                        "text": page_text,
                        "lines": line_items,
                        "sourceEngine": "azure-di",
                    }
                ],
                "text": page_text,
            }
        )

    document = build_document_from_pages(pages, ["azure-di"], needs_ocr=False)
    if not document["fullText"]:
        return None
    return ExtractionArtifact(document["fullText"], document, "hybrid", ["azure-di"])


def extract_image_with_ocr(buffer: bytes) -> ExtractionArtifact | None:
    if pytesseract is None or Image is None:
        return None

    image = Image.open(io.BytesIO(buffer)).convert("RGB")
    data = pytesseract.image_to_data(
        image,
        lang=TESSERACT_LANGUAGES,
        output_type=pytesseract.Output.DICT,
    )

    line_map: dict[tuple[int, int, int], dict[str, Any]] = {}
    total_items = len(data.get("text", []))
    for index in range(total_items):
        text = normalize_text(str(data["text"][index]))
        if not text:
            continue

        key = (
            int(data["block_num"][index]),
            int(data["par_num"][index]),
            int(data["line_num"][index]),
        )
        left = int(data["left"][index])
        top = int(data["top"][index])
        width = int(data["width"][index])
        height = int(data["height"][index])

        confidence = None
        try:
            confidence = float(data["conf"][index])
        except (TypeError, ValueError):
            confidence = None

        token = {
            "text": text,
            "bbox": {"x": left, "y": top, "width": width, "height": height},
            "confidence": confidence,
        }
        existing = line_map.get(key)
        if existing is None:
            line_map[key] = {
                "tokens": [token],
                "left": left,
                "top": top,
                "right": left + width,
                "bottom": top + height,
            }
        else:
            existing["tokens"].append(token)
            existing["left"] = min(existing["left"], left)
            existing["top"] = min(existing["top"], top)
            existing["right"] = max(existing["right"], left + width)
            existing["bottom"] = max(existing["bottom"], top + height)

    lines = []
    for line_index, (_, line) in enumerate(
        sorted(line_map.items(), key=lambda item: (item[1]["top"], item[1]["left"])),
        start=1,
    ):
        tokens = sorted(line["tokens"], key=lambda token: token["bbox"]["x"])
        line_text = normalize_text(" ".join(token["text"] for token in tokens))
        if not line_text:
            continue
        lines.append(
            {
                "id": f"page-1-line-{line_index}",
                "text": line_text,
                "bbox": {
                    "x": line["left"],
                    "y": line["top"],
                    "width": max(0, line["right"] - line["left"]),
                    "height": max(0, line["bottom"] - line["top"]),
                },
                "tokens": tokens,
            }
        )

    page_text = normalize_multiline("\n".join(line["text"] for line in lines))
    document = build_document_from_pages(
        [
            {
                "number": 1,
                "width": float(image.width),
                "height": float(image.height),
                "layout": "single-column",
                "blocks": [
                    {
                        "id": "page-1-block-1",
                        "pageNumber": 1,
                        "type": detect_block_type(page_text.splitlines()[0] if page_text else "", len(lines)),
                        "columnIndex": 0,
                        "bbox": {"x": 0, "y": 0, "width": float(image.width), "height": float(image.height)},
                        "text": page_text,
                        "lines": lines,
                        "sourceEngine": "tesseract-ocr",
                    }
                ],
                "text": page_text,
            }
        ],
        ["tesseract-ocr"],
        needs_ocr=True,
    )
    if not document["fullText"]:
        return None
    return ExtractionArtifact(document["fullText"], document, "browser-ocr", ["tesseract-ocr"])


def extract_pdf(buffer: bytes) -> dict[str, Any]:
    artifact = extract_with_azure(buffer)
    if artifact is None:
        artifact = extract_with_pymupdf(buffer)
        if artifact is not None:
            artifact = enrich_with_pdfplumber(buffer, artifact)

    if artifact is None:
        artifact = extract_image_with_ocr(buffer)

    if artifact is None:
        raise RuntimeError(
            "No extraction engine produced text. Install PyMuPDF/pdfplumber or configure Azure DI."
        )

    document = artifact.document
    document["classifier"] = build_classifier(
        document, artifact.engines_used, artifact.strategy == "browser-ocr"
    )
    return {
        "extractedText": artifact.full_text,
        "provider": "api",
        "strategy": artifact.strategy,
        "document": document,
        "classification": document["classifier"],
        "enginesUsed": artifact.engines_used,
        "capabilities": {
            "pymupdf": fitz is not None,
            "pdfplumber": pdfplumber is not None,
            "ocr": pytesseract is not None and Image is not None,
            "azure": bool(AZURE_ENDPOINT and AZURE_KEY and DocumentIntelligenceClient is not None),
            "tesseractLanguages": TESSERACT_LANGUAGES,
        },
    }


def extract_document(buffer: bytes, *, file_name: str, content_type: str = "") -> dict[str, Any]:
    normalized_type = (content_type or "").strip().lower()
    is_pdf = normalized_type == "application/pdf" or file_name.lower().endswith(".pdf")
    if is_pdf:
        return extract_pdf(buffer)

    artifact = extract_with_azure(buffer)
    if artifact is None:
        artifact = extract_image_with_ocr(buffer)

    if artifact is None:
        raise RuntimeError(
            "No extraction engine produced text for the image. Install OCR dependencies or configure Azure DI."
        )

    document = artifact.document
    document["classifier"] = build_classifier(
        document, artifact.engines_used, artifact.strategy == "browser-ocr"
    )
    return {
        "extractedText": artifact.full_text,
        "provider": "api",
        "strategy": artifact.strategy,
        "document": document,
        "classification": document["classifier"],
        "enginesUsed": artifact.engines_used,
        "capabilities": {
            "pymupdf": fitz is not None,
            "pdfplumber": pdfplumber is not None,
            "ocr": pytesseract is not None and Image is not None,
            "azure": bool(AZURE_ENDPOINT and AZURE_KEY and DocumentIntelligenceClient is not None),
            "tesseractLanguages": TESSERACT_LANGUAGES,
        },
    }


def dumps(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, ensure_ascii=False).encode("utf-8")
