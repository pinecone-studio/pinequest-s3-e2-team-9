"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useEffectEvent, useMemo } from "react";
import {
  connectToLiveExamEvents,
  type LiveExamEvent,
} from "./live-exam-events-stream";

export type UseLiveExamEventsArgs = {
  classIds: string[];
  enabled?: boolean;
  onEvent: (event: LiveExamEvent) => void;
};

export function useLiveExamEvents({
  classIds,
  enabled = true,
  onEvent,
}: UseLiveExamEventsArgs) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const handleEvent = useEffectEvent(onEvent);

  const uniqueClassIds = useMemo(
    () => [...new Set(classIds.map((classId) => classId.trim()).filter(Boolean))].sort(),
    [classIds],
  );
  const classIdsKey = uniqueClassIds.join(",");

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn || !uniqueClassIds.length) {
      return;
    }

    const abortControllers = uniqueClassIds.map(() => new AbortController());

    uniqueClassIds.forEach((classId, index) => {
      const controller = abortControllers[index];

      void connectToLiveExamEvents({
        classId,
        getToken,
        onEvent: (event) => {
          if (event.type === "connected" || event.type === "heartbeat") {
            return;
          }

          handleEvent(event);
        },
        signal: controller.signal,
      });
    });

    return () => {
      abortControllers.forEach((controller) => controller.abort());
    };
  }, [classIdsKey, enabled, getToken, isLoaded, isSignedIn, uniqueClassIds]);
}
