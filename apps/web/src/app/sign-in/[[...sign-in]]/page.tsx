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

  if (userId) {
    return (
      <AuthStatusCard
        description="A valid session already exists, so you are being redirected to the dashboard."
        eyebrow="Redirecting"
        title="Opening dashboard"
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
