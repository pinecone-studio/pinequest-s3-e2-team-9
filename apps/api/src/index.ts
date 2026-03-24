const json = (payload: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/") {
      return json({
        ok: true,
        service: "api",
        message: "PineQuest API is running",
        routes: {
          health: "/health",
          hello: "/api/hello",
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

    return json(
      {
        error: "Not Found",
      },
      { status: 404 },
    );
  },
};
