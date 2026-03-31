"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  AttemptIntegrityEventType,
  useRecordAttemptIntegrityEventMutation,
} from "@/graphql/generated";

type UseStudentExamIntegrityArgs = { attemptId: string | null; enabled: boolean };
type EventDetails = Record<string, string | number | boolean | null | undefined>;
type InputState = { timestampMs: number };

const EVENT_COOLDOWN_MS: Record<AttemptIntegrityEventType, number> = {
  [AttemptIntegrityEventType.TabHidden]: 4_000,
  [AttemptIntegrityEventType.WindowBlur]: 4_000,
  [AttemptIntegrityEventType.FullscreenExit]: 4_000,
  [AttemptIntegrityEventType.PasteAttempt]: 2_000,
  [AttemptIntegrityEventType.CopyAttempt]: 2_000,
  [AttemptIntegrityEventType.BulkInputBurst]: 4_000,
  [AttemptIntegrityEventType.InactiveThenBulkInput]: 4_000,
};

const BULK_INPUT_MIN_CHAR_DELTA = 180;
const INACTIVE_BULK_INPUT_MIN_CHAR_DELTA = 140;
const INACTIVE_INPUT_GAP_MS = 90_000;

export function useStudentExamIntegrity({
  attemptId,
  enabled,
}: UseStudentExamIntegrityArgs) {
  const [recordAttemptIntegrityEvent] = useRecordAttemptIntegrityEventMutation();
  const lastSentEventAtRef = useRef<Partial<Record<AttemptIntegrityEventType, number>>>({});
  const inputStateByQuestionRef = useRef<Record<string, InputState>>({});

  const publishEvent = useCallback(
    (type: AttemptIntegrityEventType, details: EventDetails = {}) => {
      if (!attemptId || !enabled) {
        return;
      }

      const nowMs = Date.now();
      const lastSentAt = lastSentEventAtRef.current[type] ?? 0;

      if (nowMs - lastSentAt < EVENT_COOLDOWN_MS[type]) {
        return;
      }

      lastSentEventAtRef.current[type] = nowMs;
      void recordAttemptIntegrityEvent({
        variables: { attemptId, type, details: JSON.stringify(details) },
      }).catch((error) => {
        console.error("Failed to record attempt integrity event", error);
      });
    },
    [attemptId, enabled, recordAttemptIntegrityEvent],
  );

  useEffect(() => {
    if (!attemptId || !enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        publishEvent(AttemptIntegrityEventType.TabHidden, {
          visibilityState: document.visibilityState,
        });
      }
    };
    const handleWindowBlur = () => {
      if (document.visibilityState === "visible") {
        publishEvent(AttemptIntegrityEventType.WindowBlur, {
          visibilityState: document.visibilityState,
        });
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        publishEvent(AttemptIntegrityEventType.FullscreenExit, {
          visibilityState: document.visibilityState,
        });
      }
    };
    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      publishEvent(AttemptIntegrityEventType.PasteAttempt, {
        targetTagName: target?.tagName ?? null,
      });
    };
    const handleCopy = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      publishEvent(AttemptIntegrityEventType.CopyAttempt, {
        targetTagName: target?.tagName ?? null,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("copy", handleCopy);
    };
  }, [attemptId, enabled, publishEvent]);

  useEffect(() => {
    if (!attemptId) {
      inputStateByQuestionRef.current = {};
      lastSentEventAtRef.current = {};
    }
  }, [attemptId]);

  const trackAnswerInput = (questionId: string, previousValue: string, nextValue: string) => {
    if (!attemptId || !enabled) {
      return;
    }

    const nowMs = Date.now();
    const deltaChars = nextValue.length - previousValue.length;
    const previousInput = inputStateByQuestionRef.current[questionId];
    const idleMs = previousInput ? nowMs - previousInput.timestampMs : null;

    if (deltaChars >= BULK_INPUT_MIN_CHAR_DELTA) {
      publishEvent(AttemptIntegrityEventType.BulkInputBurst, { deltaChars, questionId });
    }

    if (
      idleMs !== null
      && idleMs >= INACTIVE_INPUT_GAP_MS
      && deltaChars >= INACTIVE_BULK_INPUT_MIN_CHAR_DELTA
    ) {
      publishEvent(AttemptIntegrityEventType.InactiveThenBulkInput, {
        deltaChars,
        idleMs,
        questionId,
      });
    }

    inputStateByQuestionRef.current[questionId] = { timestampMs: nowMs };
  };

  return { trackAnswerInput };
}
