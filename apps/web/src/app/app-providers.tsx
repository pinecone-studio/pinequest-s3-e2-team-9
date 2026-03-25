"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ApolloAppProvider } from "@/components/apollo-provider";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AppProviders({ children }: { children: ReactNode }) {
  const app = <ApolloAppProvider>{children}</ApolloAppProvider>;

  if (!publishableKey) {
    return app;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/dashboard"
      signInUrl="/sign-in"
    >
      {app}
    </ClerkProvider>
  );
}
