import { getApiBaseUrl } from "./graphql-endpoint";

export type LiveQuestionBankEvent = {
  type: "question_bank_updated";
  bankId: string;
  change: "CREATED" | "UPDATED" | "DELETED" | "VARIANTS_CREATED";
  emittedAt: string;
  ownerId: string;
  questionId: string | null;
  visibility: "PRIVATE" | "PUBLIC";
};

const parseSseChunk = (chunk: string): LiveQuestionBankEvent | null => {
  const lines = chunk
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const dataLines: string[] = [];
  let eventName = "message";

  for (const line of lines) {
    if (line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (eventName !== "question_bank_updated" || !dataLines.length) {
    return null;
  }

  try {
    return JSON.parse(dataLines.join("\n")) as LiveQuestionBankEvent;
  } catch {
    return null;
  }
};

const consumeSseStream = async (
  stream: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onEvent: (event: LiveQuestionBankEvent) => void,
) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
      const segments = buffer.split("\n\n");
      buffer = segments.pop() ?? "";

      for (const segment of segments) {
        const nextEvent = parseSseChunk(segment);
        if (nextEvent) {
          onEvent(nextEvent);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

const waitForReconnect = (delayMs: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      resolve();
    };

    signal.addEventListener("abort", handleAbort, { once: true });
  });

export const connectToLiveQuestionBankEvents = async ({
  endpoint,
  getToken,
  onEvent,
  signal,
}: {
  endpoint: string;
  getToken: () => Promise<string | null>;
  onEvent: (event: LiveQuestionBankEvent) => void;
  signal: AbortSignal;
}) => {
  let attempt = 0;

  while (!signal.aborted) {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        cache: "no-store",
        headers: {
          accept: "text/event-stream",
          authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 401 || response.status === 403) {
        return;
      }

      if (response.status === 404) {
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(`SSE request failed with status ${response.status}`);
      }

      attempt = 0;
      await consumeSseStream(response.body, signal, onEvent);
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      console.error("Question bank SSE connection failed", error);
      attempt += 1;
      await waitForReconnect(Math.min(10_000, 1_000 * 2 ** attempt), signal);
    }
  }
};
