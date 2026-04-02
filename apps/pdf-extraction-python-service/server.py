from __future__ import annotations

import cgi
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from config import HOST, PORT, SHARED_TOKEN
from service import dumps, extract_document

SUPPORTED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
}


class PdfExtractionHandler(BaseHTTPRequestHandler):
    server_version = "pinequest-pdf-extraction-python/1.0"

    def _send_json(self, status: int, payload: dict) -> None:
        body = dumps(payload)
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "authorization, content-type")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _is_authorized(self) -> bool:
        if not SHARED_TOKEN:
            return True
        authorization = self.headers.get("authorization", "")
        scheme, _, token = authorization.partition(" ")
        return scheme.lower() == "bearer" and token.strip() == SHARED_TOKEN

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send_json(HTTPStatus.NO_CONTENT, {})

    def do_GET(self) -> None:  # noqa: N802
        if self.path != "/health":
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "Not Found"})
            return

        self._send_json(
          HTTPStatus.OK,
          {
              "ok": True,
              "service": "pdf-extraction-python-service",
              "mode": "multi-engine",
              "supports": ["pdf", "image"],
          },
        )

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/extract":
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "Not Found"})
            return

        if not self._is_authorized():
            self._send_json(HTTPStatus.UNAUTHORIZED, {"error": "Unauthorized"})
            return

        content_type = self.headers.get("content-type", "")
        if not content_type.startswith("multipart/form-data"):
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid multipart form data."})
            return

        environ = {
            "REQUEST_METHOD": "POST",
            "CONTENT_TYPE": content_type,
        }
        form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ=environ)
        file_item = form["file"] if "file" in form else None
        if file_item is None or not getattr(file_item, "file", None):
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Import file is required."})
            return

        file_name = getattr(file_item, "filename", "upload.pdf") or "upload.pdf"
        file_type = (getattr(file_item, "type", "") or "").strip().lower()
        is_pdf = file_name.lower().endswith(".pdf") or file_type == "application/pdf"
        is_image = file_type in SUPPORTED_IMAGE_CONTENT_TYPES or file_name.lower().endswith(
            (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp")
        )
        if not is_pdf and not is_image:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Only PDF and image files are supported."})
            return

        try:
            payload = extract_document(file_item.file.read(), file_name=file_name, content_type=file_type)
            self._send_json(HTTPStatus.OK, payload)
        except RuntimeError as error:
            self._send_json(HTTPStatus.UNPROCESSABLE_ENTITY, {"error": str(error)})
        except Exception as error:  # pragma: no cover
            self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(error)})


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), PdfExtractionHandler)
    print(f"pdf-extraction-python-service listening on http://{HOST}:{PORT}")
    server.serve_forever()
