const sseHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, apollo-require-preflight",
  "cache-control": "no-store, no-transform",
  connection: "keep-alive",
  "content-type": "text/event-stream; charset=utf-8",
  "x-accel-buffering": "no",
} satisfies Record<string, string>;

type DurableObjectIdLike = unknown;

type DurableObjectStubLike = {
  fetch(input: string | URL | Request, init?: RequestInit): Promise<Response>;
};

type DurableObjectNamespaceLike = {
  idFromName(name: string): DurableObjectIdLike;
  get(id: DurableObjectIdLike): DurableObjectStubLike;
};

export type LiveExamMutationEvent =
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
      type: "exam_published";
      classId: string;
      endsAt: string | null;
      emittedAt: string;
      examId: string;
      startedAt: string | null;
      status: "PUBLISHED";
      title: string;
    }
  | {
      type: "exam_closed";
      classId: string;
      endsAt: string | null;
      emittedAt: string;
      examId: string;
      startedAt: string | null;
      status: "CLOSED";
      title: string;
    };

export type QuestionBankMutationEvent = {
  type: "question_bank_updated";
  bankId: string;
  change: "CREATED" | "UPDATED" | "DELETED" | "VARIANTS_CREATED";
  emittedAt: string;
  ownerId: string;
  questionId: string | null;
  visibility: "PRIVATE" | "PUBLIC";
};

export type LiveMutationEvent =
  | LiveExamMutationEvent
  | QuestionBankMutationEvent;

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
  | LiveMutationEvent;

export type LiveExamEventsEnv = {
  LIVE_EXAM_EVENTS?: DurableObjectNamespaceLike;
};

type LiveExamConnectionMetadata = {
  actorId?: string;
};

const encodeSseMessage = (event: LiveExamEvent): string =>
  `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;

const createJsonResponse = (
  payload: unknown,
  init?: ResponseInit,
): Response =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      ...sseHeaders,
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });

const getRoomStub = (
  env: LiveExamEventsEnv,
  roomKey: string,
): DurableObjectStubLike => {
  const namespace = env.LIVE_EXAM_EVENTS;

  if (!namespace) {
    throw new Error("LIVE_EXAM_EVENTS binding is not configured.");
  }

  return namespace.get(namespace.idFromName(roomKey));
};

const connectLiveRoom = async (
  env: LiveExamEventsEnv,
  roomKey: string,
  metadata: LiveExamConnectionMetadata,
): Promise<Response> =>
  getRoomStub(env, roomKey).fetch("https://live-exam-events/connect", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

const publishLiveRoomEvent = async (
  env: LiveExamEventsEnv,
  roomKey: string,
  event: LiveMutationEvent,
): Promise<void> => {
  if (!env.LIVE_EXAM_EVENTS) {
    return;
  }

  await getRoomStub(env, roomKey).fetch("https://live-exam-events/publish", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(event),
  });
};

export const connectLiveExamEvents = async (
  env: LiveExamEventsEnv,
  classId: string,
  metadata: LiveExamConnectionMetadata,
): Promise<Response> =>
  connectLiveRoom(env, `class:${classId}`, metadata);

export const connectTeacherQuestionBankEvents = async (
  env: LiveExamEventsEnv,
  teacherId: string,
  metadata: LiveExamConnectionMetadata,
): Promise<Response> =>
  connectLiveRoom(env, `teacher:${teacherId}:question-banks`, metadata);

export const connectPublicQuestionBankEvents = async (
  env: LiveExamEventsEnv,
  metadata: LiveExamConnectionMetadata,
): Promise<Response> =>
  connectLiveRoom(env, "question-banks:public", metadata);

export const publishLiveExamEvent = async (
  env: LiveExamEventsEnv,
  event: LiveExamMutationEvent,
): Promise<void> => {
  await publishLiveRoomEvent(env, `class:${event.classId}`, event);
};

export const publishQuestionBankEvent = async (
  env: LiveExamEventsEnv,
  event: QuestionBankMutationEvent,
): Promise<void> => {
  await publishLiveRoomEvent(env, `teacher:${event.ownerId}:question-banks`, event);

  if (event.visibility === "PUBLIC") {
    await publishLiveRoomEvent(env, "question-banks:public", event);
  }
};

export class LiveExamEvents {
  private readonly encoder = new TextEncoder();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private readonly connections = new Map<
    string,
    ReadableStreamDefaultController<Uint8Array>
  >();
  private readonly roomId: string;

  constructor(
    state: {
      id?: {
        toString?: () => string;
      };
    },
  ) {
    this.roomId = state.id?.toString?.() ?? "live-exam-room";
  }

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "POST" && pathname === "/connect") {
      return this.handleConnect(request);
    }

    if (request.method === "POST" && pathname === "/publish") {
      return this.handlePublish(request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: sseHeaders,
      });
    }

    return createJsonResponse({ error: "Not Found" }, { status: 404 });
  }

  private async handleConnect(request: Request): Promise<Response> {
    const connectionId = crypto.randomUUID();
    const metadata = (await request.json().catch(() => null)) as
      | LiveExamConnectionMetadata
      | null;

    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => {
        this.connections.set(connectionId, controller);
        this.ensureHeartbeat();
        this.sendEvent(controller, {
          type: "connected",
          connectedAt: new Date().toISOString(),
          roomId: metadata?.actorId
            ? `${this.roomId}:${metadata.actorId}`
            : this.roomId,
        });
      },
      cancel: () => {
        this.disconnect(connectionId, false);
      },
    });

    request.signal.addEventListener(
      "abort",
      () => {
        this.disconnect(connectionId, false);
      },
      { once: true },
    );

    return new Response(stream, {
      headers: sseHeaders,
    });
  }

  private async handlePublish(request: Request): Promise<Response> {
    const payload = (await request.json().catch(() => null)) as LiveMutationEvent | null;

    if (!payload?.type) {
      return createJsonResponse({ error: "Invalid SSE payload" }, { status: 400 });
    }

    const delivered = this.broadcast(payload);

    return createJsonResponse({
      delivered,
      ok: true,
      roomId: this.roomId,
    });
  }

  private broadcast(event: LiveExamEvent): number {
    let delivered = 0;

    for (const [connectionId, controller] of this.connections) {
      const success = this.sendEvent(controller, event);

      if (!success) {
        this.disconnect(connectionId, true);
        continue;
      }

      delivered += 1;
    }

    return delivered;
  }

  private sendEvent(
    controller: ReadableStreamDefaultController<Uint8Array>,
    event: LiveExamEvent,
  ): boolean {
    try {
      controller.enqueue(this.encoder.encode(encodeSseMessage(event)));
      return true;
    } catch {
      return false;
    }
  }

  private disconnect(connectionId: string, shouldClose: boolean) {
    const controller = this.connections.get(connectionId);

    if (!controller) {
      return;
    }

    this.connections.delete(connectionId);

    if (shouldClose) {
      try {
        controller.close();
      } catch {
        // The client may already have disconnected.
      }
    }

    if (this.connections.size === 0) {
      this.stopHeartbeat();
    }
  }

  private ensureHeartbeat() {
    if (this.heartbeatTimer) {
      return;
    }

    this.heartbeatTimer = setInterval(() => {
      this.broadcast({
        type: "heartbeat",
        emittedAt: new Date().toISOString(),
      });
    }, 25_000);
  }

  private stopHeartbeat() {
    if (!this.heartbeatTimer) {
      return;
    }

    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
}
