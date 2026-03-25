"use client";

import { useEffect } from "react";

type WindowWithClerkIntent = Window & {
  __internal_onBeforeSetActive?: (intent?: string) => Promise<unknown> | unknown;
};

export function ClerkSignOutFix() {
  useEffect(() => {
    const win = window as WindowWithClerkIntent;
    const originalBeforeSetActive = win.__internal_onBeforeSetActive;

    win.__internal_onBeforeSetActive = (intent?: string) => {
      if (intent === "sign-out") {
        return Promise.resolve();
      }

      return originalBeforeSetActive?.(intent);
    };

    return () => {
      win.__internal_onBeforeSetActive = originalBeforeSetActive;
    };
  }, []);

  return null;
}
