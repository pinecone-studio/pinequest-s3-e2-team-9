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

type Env = {
  DB: D1DatabaseLike;
  CLERK_SECRET_KEY?: string;
} & LiveExamEventsEnv;

type GraphQLRequestBody = {
  query?: string;
  variables?: Record<string, unknown> | null;
  operationName?: string | null;
};

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
