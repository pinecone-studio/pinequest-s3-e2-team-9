/* eslint-disable max-lines */
import { getApiBaseUrl } from "./graphql-endpoint";

export type LiveExamEvent =
  | {
      type: "connected";
      connectedAt: string;
      roomId: string;
    }
  | {
      type: "heartbeat";
      emittedAt: string;
    }
  | {
      type: "exam_assigned";
      classId: string;
      endsAt: null;
      emittedAt: string;
      examId: string;
      startedAt: null;
      status: "DRAFT";
      title: string;
    }
  | {
      type: "attempt_started";
      attemptId: string;
      classId: string;
      emittedAt: string;
      examId: string;
      startedAt: string;
      status: "IN_PROGRESS";
      studentId: string;
      submittedAt: null;
    }
  | {
      type: "attempt_submitted";
      attemptId: string;
      classId: string;
      emittedAt: string;
      examId: string;
      startedAt: string;
      status: "SUBMITTED";
      studentId: string;
      submittedAt: string;
    }
  | {
      type: "attempt_reviewed";
      attemptId: string;
      classId: string;
      emittedAt: string;
      examId: string;
      startedAt: string;
      status: "GRADED";
      studentId: string;
      submittedAt: string;
    }
  | {
      type: "exam_published" | "exam_closed";
      classId: string;
      endsAt: string | null;
      emittedAt: string;
      examId: string;
      startedAt: string | null;
      status: "PUBLISHED" | "CLOSED";
      title: string;
    };

const parseSseChunk = (chunk: string): LiveExamEvent | null => {
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

  if (!dataLines.length) {
    return null;
  }

  try {
    const payload = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
    return { ...payload, type: eventName } as LiveExamEvent;
  } catch {
    return null;
  }
};

const consumeSseStream = async (
  stream: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onEvent: (event: LiveExamEvent) => void,
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

export const connectToLiveExamEvents = async ({
  classId,
  getToken,
  onEvent,
  signal,
}: {
  classId: string;
  getToken: () => Promise<string | null>;
  onEvent: (event: LiveExamEvent) => void;
  signal: AbortSignal;
}) => {
  let attempt = 0;

  while (!signal.aborted) {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(
        `${getApiBaseUrl()}/events/classes/${encodeURIComponent(classId)}/exams`,
        {
          cache: "no-store",
          headers: {
            accept: "text/event-stream",
            authorization: `Bearer ${token}`,
          },
          signal,
        },
      );

      if (response.status === 401 || response.status === 403) {
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

      console.error("Live exam SSE connection failed", error);
      attempt += 1;
      await waitForReconnect(Math.min(10_000, 1_000 * 2 ** attempt), signal);
    }
  }
};
