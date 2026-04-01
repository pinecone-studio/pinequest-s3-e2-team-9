import http from "node:http";
import { extractPdfTextFromBuffer } from "./extract-pdf-text.mjs";

const host = process.env.HOST?.trim() || "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "8788", 10);
const sharedToken = process.env.PDF_EXTRACTION_SERVICE_TOKEN?.trim() || "";

const responseHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "content-type": "application/json; charset=utf-8",
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, responseHeaders);
  response.end(status === 204 ? "" : JSON.stringify(payload));
};

const isAuthorized = (request) => {
  if (!sharedToken) {
    return true;
  }

  const authorization = request.headers.authorization;
  if (!authorization) {
    return false;
  }

  const [scheme, token] = authorization.split(" ", 2);
  return scheme?.toLowerCase() === "bearer" && token?.trim() === sharedToken;
};

const createWebRequest = (request) =>
  new Request(`http://${request.headers.host ?? `${host}:${port}`}${request.url ?? "/"}`, {
    method: request.method,
    headers: request.headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request,
    duplex: "half",
  });

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? `${host}:${port}`}`,
    );

    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "pdf-extraction-service",
        mode: "text-only",
      });
      return;
    }

    if (request.method !== "POST" || url.pathname !== "/extract") {
      sendJson(response, 404, { error: "Not Found" });
      return;
    }

    if (!isAuthorized(request)) {
      sendJson(response, 401, { error: "Unauthorized" });
      return;
    }

    const formData = await createWebRequest(request).formData().catch(() => null);
    if (!formData) {
      sendJson(response, 400, { error: "Invalid multipart form data." });
      return;
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      sendJson(response, 400, { error: "PDF file is required." });
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      sendJson(response, 400, { error: "Only PDF files are supported." });
      return;
    }

    const extractedText = await extractPdfTextFromBuffer(await file.arrayBuffer());
    if (!extractedText) {
      sendJson(response, 422, {
        error: "No selectable text found in the PDF. OCR is not enabled in this service.",
      });
      return;
    }

    sendJson(response, 200, {
      extractedText,
      provider: "api",
      strategy: "text-layer",
    });
  } catch (error) {
    sendJson(response, 500, {
      error:
        error instanceof Error
          ? error.message
          : "PDF extraction failed.",
    });
  }
});

server.listen(port, host, () => {
  console.log(`pdf-extraction-service listening on http://${host}:${port}`);
});
