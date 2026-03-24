"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AuthStatusCard, ClerkConfigCard } from "../../auth-status-card";
import { SignInForm } from "./sign-in-form";

const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const runtime = "edge";

function SignInGate() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      router.replace("/dashboard");
    }
  }, [isLoaded, router, userId]);

  if (!isLoaded || userId) {
    return (
      <AuthStatusCard
        description="Checking the current session before showing the one-time code login form."
        eyebrow="Loading"
        title="Preparing sign in"
      />
    );
  }

  return <SignInForm />;
}

export default function SignInPage() {
  if (!hasClerkConfig) {
    return <ClerkConfigCard />;
  }

  return <SignInGate />;
}
