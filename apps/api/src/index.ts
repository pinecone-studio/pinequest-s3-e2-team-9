import { buildSchema, graphql } from "graphql";
import {
  ApiAuthError,
  authenticateActor,
  createRequestContext,
  ensureClerkUserForAppUser,
  findUserByEmail,
  toAuthResponse,
} from "./auth";
import { first, type D1DatabaseLike } from "./lib/d1";
import { createRootValue } from "./graphql/root-value";
import { schemaSource } from "./graphql/schema";
import type { Role } from "./graphql/types";
import {
  connectLiveExamEvents,
  connectPublicQuestionBankEvents,
  connectTeacherQuestionBankEvents,
  type LiveExamEventsEnv,
} from "./live-exam-events";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, apollo-require-preflight",
} satisfies Record<string, string>;

const json = (payload: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });

const html = (markup: string, init?: ResponseInit): Response =>
  new Response(markup, {
    ...init,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });

const empty = (init?: ResponseInit): Response =>
  new Response(null, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });

const schema = buildSchema(schemaSource);
const classExamEventsPathPattern = /^\/events\/classes\/([^/]+)\/exams$/;
const teacherQuestionBankEventsPathPattern = /^\/events\/teachers\/([^/]+)\/question-banks$/;
const publicQuestionBankEventsPath = "/events/question-banks/public";
const imageUploadPathPattern = /^\/uploads\/image\/(.+)$/;

type R2HttpMetadata = {
  contentDisposition?: string;
  contentType?: string;
};

type R2ObjectBodyLike = {
  body: ReadableStream | null;
  httpMetadata?: R2HttpMetadata;
  writeHttpMetadata?: (headers: Headers) => void;
};

type R2BucketLike = {
  get: (key: string) => Promise<R2ObjectBodyLike | null>;
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | Blob | ReadableStream | string,
    options?: {
      customMetadata?: Record<string, string>;
      httpMetadata?: R2HttpMetadata;
    },
  ) => Promise<unknown>;
};

type Env = {
  DB: D1DatabaseLike;
  CLERK_SECRET_KEY?: string;
  PDF_EXTRACTION_SERVICE_TOKEN?: string;
  PDF_EXTRACTION_SERVICE_URL?: string;
  IMAGE_UPLOADS?: R2BucketLike;
} & LiveExamEventsEnv;

type GraphQLRequestBody = {
  query?: string;
  variables?: Record<string, unknown> | null;
  operationName?: string | null;
};

type PdfExtractionResponse = {
  extractedText: string;
  provider: string;
  strategy: string;
};

const isPdfExtractionResponse = (
  value: unknown,
): value is PdfExtractionResponse =>
  typeof value === "object" &&
  value !== null &&
  "extractedText" in value &&
  typeof value.extractedText === "string" &&
  "provider" in value &&
  typeof value.provider === "string" &&
  "strategy" in value &&
  typeof value.strategy === "string";

const graphiqlPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PineQuest GraphQL</title>
    <style>
      :root {
        color-scheme: light;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f6f8fb;
        color: #0f172a;
      }
      body {
        margin: 0;
        padding: 32px 20px;
      }
      main {
        max-width: 880px;
        margin: 0 auto;
        background: white;
        border: 1px solid #dbe3f0;
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
      }
      p {
        margin: 0 0 16px;
        color: #475569;
      }
      textarea {
        width: 100%;
        min-height: 180px;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        padding: 14px;
        font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
        box-sizing: border-box;
        margin-bottom: 12px;
      }
      button {
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        background: #0f172a;
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
      pre {
        margin: 16px 0 0;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        overflow: auto;
        min-height: 120px;
      }
      code {
        background: #e2e8f0;
        padding: 2px 6px;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>PineQuest GraphQL</h1>
      <p>Run a query against <code>/graphql</code> directly from the browser.</p>
      <textarea id="query">{
  health {
    ok
    service
    runtime
  }
}</textarea>
      <button id="run" type="button">Run Query</button>
      <pre id="result">Click "Run Query" to execute.</pre>
    </main>
    <script>
      const button = document.getElementById("run");
      const queryInput = document.getElementById("query");
      const result = document.getElementById("result");

      async function runQuery() {
        result.textContent = "Loading...";

        try {
          const response = await fetch("/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query: queryInput.value }),
          });

          const payload = await response.json();
          result.textContent = JSON.stringify(payload, null, 2);
        } catch (error) {
          result.textContent = JSON.stringify(
            { errors: [{ message: error instanceof Error ? error.message : "Request failed" }] },
            null,
            2,
          );
        }
      }

      button.addEventListener("click", runQuery);
    </script>
  </body>
</html>`;

const parseGraphQLRequest = async (
  request: Request,
): Promise<GraphQLRequestBody | Response> => {
  if (request.method === "GET") {
    const { searchParams } = new URL(request.url);
    return {
      query: searchParams.get("query") ?? undefined,
      operationName: searchParams.get("operationName"),
      variables: searchParams.get("variables")
        ? JSON.parse(searchParams.get("variables") as string)
        : null,
    };
  }

  try {
    return (await request.json()) as GraphQLRequestBody;
  } catch {
    return json(
      {
        errors: [{ message: "Invalid JSON body" }],
      },
      { status: 400 },
    );
  }
};

const handleGraphQL = async (request: Request, env: Env): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return empty({ status: 204 });
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return json(
      {
        errors: [{ message: "Method Not Allowed" }],
      },
      { status: 405 },
    );
  }

  const parsed = await parseGraphQLRequest(request);
  if (parsed instanceof Response) {
    return parsed;
  }

  if (request.method === "GET" && !parsed.query) {
    return html(graphiqlPage);
  }

  if (!parsed.query) {
    return json(
      {
        errors: [{ message: "GraphQL query is required" }],
      },
      { status: 400 },
    );
  }

  try {
    const contextValue = await createRequestContext(request, env.DB, env);
    const result = await graphql({
      schema,
      source: parsed.query,
      rootValue: createRootValue({
        db: env.DB,
        env,
      }),
      contextValue,
      variableValues: parsed.variables ?? undefined,
      operationName: parsed.operationName ?? undefined,
    });

    return json(result, {
      status: result.errors?.length ? 400 : 200,
    });
  } catch (error) {
    return json(
      {
        errors: [
          {
            message:
              error instanceof Error ? error.message : "Unexpected GraphQL error",
          },
        ],
      },
      { status: 500 },
    );
  }
};

const canActorAccessClassEvents = async (
  db: D1DatabaseLike,
  actorId: string,
  role: Role,
  classId: string,
): Promise<boolean> => {
  if (role === "ADMIN") {
    return true;
  }

  if (role === "TEACHER") {
    return Boolean(
      await first<{ id: string }>(
        db,
        `SELECT id
         FROM classes
         WHERE id = ? AND teacher_id = ?`,
        [classId, actorId],
      ),
    );
  }

  return Boolean(
    await first<{ id: string }>(
      db,
      `SELECT c.id
       FROM classes c
       JOIN class_students cs ON cs.class_id = c.id
       WHERE c.id = ? AND cs.student_id = ?`,
      [classId, actorId],
    ),
  );
};

const handleClassExamEvents = async (
  request: Request,
  env: Env,
  classId: string,
): Promise<Response> => {
  if (request.method !== "GET") {
    return json(
      {
        error: "Method Not Allowed",
      },
      { status: 405 },
    );
  }

  try {
    const actor = await authenticateActor(request, env.DB, env);

    if (!actor) {
      throw new ApiAuthError(401, "Authentication required.");
    }

    const canAccess = await canActorAccessClassEvents(
      env.DB,
      actor.user.id,
      actor.user.role,
      classId,
    );

    if (!canAccess) {
      throw new ApiAuthError(403, "You do not have access to this class event stream.");
    }

    return connectLiveExamEvents(env, classId, {
      actorId: actor.user.id,
    });
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Unable to connect to live exam events.";

    return json(
      {
        error: message,
      },
      { status },
    );
  }
};

const canActorAccessTeacherQuestionBankEvents = (
  actorId: string,
  role: Role,
  teacherId: string,
): boolean => role === "ADMIN" || (role === "TEACHER" && actorId === teacherId);

const handleTeacherQuestionBankEvents = async (
  request: Request,
  env: Env,
  teacherId: string,
): Promise<Response> => {
  if (request.method !== "GET") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const actor = await authenticateActor(request, env.DB, env);

    if (!actor) {
      throw new ApiAuthError(401, "Authentication required.");
    }

    if (!canActorAccessTeacherQuestionBankEvents(actor.user.id, actor.user.role, teacherId)) {
      throw new ApiAuthError(403, "You do not have access to this teacher event stream.");
    }

    return connectTeacherQuestionBankEvents(env, teacherId, {
      actorId: actor.user.id,
    });
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Unable to connect to question bank events.";

    return json({ error: message }, { status });
  }
};

const handlePublicQuestionBankEvents = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method !== "GET") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const actor = await authenticateActor(request, env.DB, env);

    if (!actor) {
      throw new ApiAuthError(401, "Authentication required.");
    }

    if (actor.user.role !== "ADMIN" && actor.user.role !== "TEACHER") {
      throw new ApiAuthError(403, "You do not have access to public question bank events.");
    }

    return connectPublicQuestionBankEvents(env, {
      actorId: actor.user.id,
    });
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Unable to connect to public question bank events.";

    return json({ error: message }, { status });
  }
};

type EmailAccessRequestBody = {
  email?: string;
};

const parseEmailAccessRequest = async (
  request: Request,
): Promise<EmailAccessRequestBody | Response> => {
  try {
    return (await request.json()) as EmailAccessRequestBody;
  } catch {
    return json(
      {
        error: "Invalid JSON body",
      },
      { status: 400 },
    );
  }
};

const handleLoginEligibility = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return empty({ status: 204 });
  }

  if (request.method !== "POST") {
    return json(
      {
        error: "Method Not Allowed",
      },
      { status: 405 },
    );
  }

  const parsed = await parseEmailAccessRequest(request);
  if (parsed instanceof Response) {
    return parsed;
  }

  const email = parsed.email?.trim().toLowerCase();
  if (!email) {
    return json(
      {
        error: "Email is required",
      },
      { status: 400 },
    );
  }

  const user = await findUserByEmail(env.DB, email);
  if (!user) {
    return json(
      {
        error: "This email address is not allowed to sign in.",
      },
      { status: 403 },
    );
  }

  try {
    await ensureClerkUserForAppUser(user, env);
  } catch (error) {
    console.error("Failed to sync Clerk user during login eligibility", error);
    return json(
      {
        error:
          "Authentication service is unreachable. Check the API deployment or endpoint configuration.",
      },
      { status: 503 },
    );
  }

  return json(toAuthResponse(user));
};

const handleSession = async (request: Request, env: Env): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return empty({ status: 204 });
  }

  if (request.method !== "GET") {
    return json(
      {
        error: "Method Not Allowed",
      },
      { status: 405 },
    );
  }

  try {
    const actor = await authenticateActor(request, env.DB, env);
    if (!actor) {
      throw new ApiAuthError(401, "Authentication required.");
    }

    return json(toAuthResponse(actor.user));
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Unable to resolve session.";
    return json(
      {
        error: message,
      },
      { status },
    );
  }
};

const parsePdfExtractionResponse = async (
  response: Response,
): Promise<PdfExtractionResponse | Response> => {
  const payload = (await response.json().catch(() => null)) as
    | PdfExtractionResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    return json(
      {
        error:
          typeof payload === "object" &&
          payload &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "PDF extraction service request failed.",
      },
      { status: response.status },
    );
  }

  if (!isPdfExtractionResponse(payload)) {
    return json(
      {
        error: "PDF extraction service returned an invalid payload.",
      },
      { status: 502 },
    );
  }

  return payload;
};

const handlePdfExtraction = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return empty({ status: 204 });
  }

  if (request.method !== "POST") {
    return json(
      {
        error: "Method Not Allowed",
      },
      { status: 405 },
    );
  }

  const actor = await authenticateActor(request, env.DB, env);
  if (!actor || (actor.user.role !== "ADMIN" && actor.user.role !== "TEACHER")) {
    return json(
      {
        error: "Authentication required.",
      },
      { status: 401 },
    );
  }

  if (!env.PDF_EXTRACTION_SERVICE_URL?.trim()) {
    return json(
      {
        error: "PDF extraction service is not configured on the API.",
      },
      { status: 501 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return json(
      {
        error: "Invalid multipart form data.",
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return json(
      {
        error: "PDF file is required.",
      },
      { status: 400 },
    );
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return json(
      {
        error: "Only PDF files are supported.",
      },
      { status: 400 },
    );
  }

  const upstreamFormData = new FormData();
  upstreamFormData.set("file", file, file.name);
  upstreamFormData.set("actorId", actor.user.id);
  upstreamFormData.set("actorRole", actor.user.role);

  const upstreamHeaders = new Headers();
  if (env.PDF_EXTRACTION_SERVICE_TOKEN?.trim()) {
    upstreamHeaders.set(
      "authorization",
      `Bearer ${env.PDF_EXTRACTION_SERVICE_TOKEN.trim()}`,
    );
  }

  try {
    const upstreamResponse = await fetch(env.PDF_EXTRACTION_SERVICE_URL.trim(), {
      method: "POST",
      headers: upstreamHeaders,
      body: upstreamFormData,
    });

    const parsed = await parsePdfExtractionResponse(upstreamResponse);
    if (parsed instanceof Response) {
      return parsed;
    }

    return json(parsed);
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PDF extraction service is unreachable.",
      },
      { status: 503 },
    );
  }
};

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

const getImageExtension = (
  contentType: string,
  originalName: string,
): string => {
  const normalizedContentType = contentType.trim().toLowerCase();

  if (normalizedContentType === "image/jpeg") {
    return "jpg";
  }
  if (normalizedContentType === "image/png") {
    return "png";
  }
  if (normalizedContentType === "image/webp") {
    return "webp";
  }
  if (normalizedContentType === "image/gif") {
    return "gif";
  }
  if (normalizedContentType === "image/svg+xml") {
    return "svg";
  }
  if (normalizedContentType === "image/bmp") {
    return "bmp";
  }

  const [, extension] = originalName.trim().toLowerCase().match(/\.([a-z0-9]+)$/) ?? [];
  return extension || "bin";
};

const requireAuthenticatedActor = async (
  request: Request,
  env: Env,
) => {
  const actor = await authenticateActor(request, env.DB, env);

  if (!actor) {
    throw new ApiAuthError(401, "Authentication required.");
  }

  return actor;
};

const requireImageUploadsBucket = (env: Env): R2BucketLike => {
  if (!env.IMAGE_UPLOADS) {
    throw new ApiAuthError(
      503,
      "IMAGE_UPLOADS bucket is not configured on the API.",
    );
  }

  return env.IMAGE_UPLOADS;
};

const handleImageUpload = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return empty({ status: 204 });
  }

  if (request.method !== "POST") {
    return json(
      {
        error: "Method Not Allowed",
      },
      { status: 405 },
    );
  }

  try {
    const actor = await requireAuthenticatedActor(request, env);
    const bucket = requireImageUploadsBucket(env);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return json(
        {
          error: "Зураг файл шаардлагатай.",
        },
        { status: 400 },
      );
    }

    if (!file.type.trim().toLowerCase().startsWith("image/")) {
      return json(
        {
          error: "Зөвхөн зургийн файл оруулна.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return json(
        {
          error: "Зургийн хэмжээ 10MB-аас ихгүй байна.",
        },
        { status: 400 },
      );
    }

    const extension = getImageExtension(file.type, file.name);
    const key = `answers/${actor.user.role.toLowerCase()}/${actor.user.id}/${crypto.randomUUID()}.${extension}`;

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentDisposition: `inline; filename="${file.name.replace(/\"/g, "") || "upload"}"`,
        contentType: file.type,
      },
      customMetadata: {
        actorId: actor.user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    return json({
      key,
      value: `r2:${key}`,
    });
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Зураг оруулах үед алдаа гарлаа.";

    return json(
      {
        error: message,
      },
      { status },
    );
  }
};

const handleImageDownload = async (
  request: Request,
  env: Env,
  key: string,
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return empty({ status: 204 });
  }

  if (request.method !== "GET") {
    return json(
      {
        error: "Method Not Allowed",
      },
      { status: 405 },
    );
  }

  try {
    await requireAuthenticatedActor(request, env);
    const bucket = requireImageUploadsBucket(env);
    const object = await bucket.get(key);

    if (!object?.body) {
      return json(
        {
          error: "Зургийг олсонгүй.",
        },
        { status: 404 },
      );
    }

    const headers = new Headers(corsHeaders);
    headers.set("cache-control", "no-store");

    if (object.writeHttpMetadata) {
      object.writeHttpMetadata(headers);
    } else if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }

    return new Response(object.body, {
      headers,
      status: 200,
    });
  } catch (error) {
    const status = error instanceof ApiAuthError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Зургийг дуудаж чадсангүй.";

    return json(
      {
        error: message,
      },
      { status },
    );
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return empty({ status: 204 });
    }

    if (request.method === "GET" && pathname === "/") {
      return json({
        ok: true,
        service: "api",
        message: "PineQuest API is running",
        routes: {
          health: "/health",
          hello: "/api/hello",
          loginEligibility: "/auth/login-eligibility",
          session: "/auth/session",
          imageUpload: "/uploads/image",
          imageDownload: "/uploads/image/:key",
          classExamEvents: "/events/classes/:classId/exams",
          teacherQuestionBankEvents: "/events/teachers/:teacherId/question-banks",
          publicQuestionBankEvents: publicQuestionBankEventsPath,
          graphql: "/graphql",
        },
      });
    }

    if (request.method === "GET" && pathname === "/health") {
      return json({
        ok: true,
        service: "api",
        runtime: "cloudflare-workers",
      });
    }

    if (request.method === "GET" && pathname === "/api/hello") {
      return json({
        message: "Hello from the Pinequest API",
      });
    }

    if (pathname === "/auth/login-eligibility") {
      return handleLoginEligibility(request, env);
    }

    if (pathname === "/auth/session") {
      return handleSession(request, env);
    }

    if (pathname === "/imports/pdf/extract") {
      return handlePdfExtraction(request, env);
    }

    if (pathname === "/uploads/image") {
      return handleImageUpload(request, env);
    }

    const imageUploadMatch = pathname.match(imageUploadPathPattern);
    if (imageUploadMatch) {
      return handleImageDownload(
        request,
        env,
        decodeURIComponent(imageUploadMatch[1]),
      );
    }

    if (pathname === "/graphql") {
      return handleGraphQL(request, env);
    }

    const classExamEventsMatch = pathname.match(classExamEventsPathPattern);
    if (classExamEventsMatch) {
      return handleClassExamEvents(
        request,
        env,
        decodeURIComponent(classExamEventsMatch[1]),
      );
    }

    const teacherQuestionBankEventsMatch = pathname.match(
      teacherQuestionBankEventsPathPattern,
    );
    if (teacherQuestionBankEventsMatch) {
      return handleTeacherQuestionBankEvents(
        request,
        env,
        decodeURIComponent(teacherQuestionBankEventsMatch[1]),
      );
    }

    if (pathname === publicQuestionBankEventsPath) {
      return handlePublicQuestionBankEvents(request, env);
    }

    return json(
      {
        error: "Not Found",
      },
      { status: 404 },
    );
  },
};

export { LiveExamEvents } from "./live-exam-events";
