import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "https://pinequest-api.b94889340.workers.dev";
const authToken = __ENV.AUTH_TOKEN || "";

function openFromKnownRoots(path) {
  const attempts = [path, `../${path.replace(/^\.?\//, "")}`];

  for (const candidate of attempts) {
    try {
      return open(candidate);
    } catch {
      // Дараагийн боломжит замыг шалгана.
    }
  }

  throw new Error(`QUERY_FILE/VARIABLES_FILE-аас файл нээж чадсангүй: ${path}`);
}

const query =
  __ENV.QUERY_FILE && __ENV.QUERY_FILE.length > 0
    ? openFromKnownRoots(__ENV.QUERY_FILE)
    : "query { health { ok service runtime } }";
const variables =
  __ENV.VARIABLES_FILE && __ENV.VARIABLES_FILE.length > 0
    ? JSON.parse(openFromKnownRoots(__ENV.VARIABLES_FILE))
    : {};

const vus = Number(__ENV.VUS || 10);
const duration = __ENV.DURATION || "30s";
const pauseSeconds = Number(__ENV.SLEEP_SECONDS || 1);
const debugFailures = (__ENV.DEBUG_FAILURES || "").trim() === "1";
let failureLogged = false;

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
  },
};

function makeHeaders() {
  const headers = {
    "content-type": "application/json",
  };

  if (authToken) {
    headers.authorization = `Bearer ${authToken}`;
  }

  return headers;
}

export default function () {
  const response = http.post(
    `${baseUrl}/graphql`,
    JSON.stringify({ query, variables }),
    {
      headers: makeHeaders(),
      tags: {
        operation: __ENV.OPERATION_NAME || "custom-graphql",
      },
    },
  );

  if (debugFailures && !failureLogged) {
    let hasGraphqlErrors = false;

    try {
      const body = response.json();
      hasGraphqlErrors = Boolean(body?.errors);
    } catch {
      hasGraphqlErrors = true;
    }

    if (response.status !== 200 || hasGraphqlErrors) {
      failureLogged = true;
      console.error(
        `Эхний failed response: status=${response.status}, body=${String(response.body).slice(0, 800)}`,
      );
    }
  }

  check(response, {
    "status 200 байх": (res) => res.status === 200,
    "response нь json байх": (res) =>
      String(res.headers["Content-Type"] || "").includes("application/json"),
    "graphql алдаагүй байх": (res) => {
      try {
        const body = res.json();
        return !body.errors;
      } catch {
        return false;
      }
    },
  });

  sleep(pauseSeconds);
}
