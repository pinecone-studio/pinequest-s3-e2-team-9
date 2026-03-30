"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import {
  connectToLiveQuestionBankEvents,
  type LiveQuestionBankEvent,
} from "./live-question-bank-events-stream";

export function useLiveQuestionBankEvents({
  teacherId,
  includePublic = false,
  enabled = true,
  onEvent,
}: {
  teacherId?: string | null;
  includePublic?: boolean;
  enabled?: boolean;
  onEvent: (event: LiveQuestionBankEvent) => void;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const handleEvent = useEffectEvent(onEvent);
  const lastEventKeyRef = useRef<string | null>(null);
  const endpoints = useMemo(() => {
    const nextEndpoints: string[] = [];

    if (teacherId?.trim()) {
      nextEndpoints.push(
        `/events/teachers/${encodeURIComponent(teacherId.trim())}/question-banks`,
      );
    }

    if (includePublic) {
      nextEndpoints.push("/events/question-banks/public");
    }

    return nextEndpoints;
  }, [includePublic, teacherId]);
  const endpointsKey = endpoints.join(",");

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn || !endpoints.length) {
      return;
    }

    const abortControllers = endpoints.map(() => new AbortController());

    endpoints.forEach((endpoint, index) => {
      const controller = abortControllers[index];

      void connectToLiveQuestionBankEvents({
        endpoint,
        getToken,
        onEvent: (event) => {
          const eventKey = [
            event.type,
            event.bankId,
            event.questionId ?? "",
            event.change,
            event.emittedAt,
          ].join(":");

          if (lastEventKeyRef.current === eventKey) {
            return;
          }

          lastEventKeyRef.current = eventKey;
          handleEvent(event);
        },
        signal: controller.signal,
      });
    });

    return () => {
      abortControllers.forEach((controller) => controller.abort());
      lastEventKeyRef.current = null;
    };
  }, [enabled, endpoints, endpointsKey, getToken, isLoaded, isSignedIn]);
}
