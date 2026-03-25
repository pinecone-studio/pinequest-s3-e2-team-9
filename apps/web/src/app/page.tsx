"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AuthStatusCard } from "./auth-status-card";
import { DashboardShell } from "./components/dashboard-shell";

const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function HomeRedirect() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    router.replace(userId ? "/dashboard" : "/sign-in");
  }, [isLoaded, router, userId]);

  return (
    <AuthStatusCard
      description="Checking the current Clerk session before routing you to the right page."
      eyebrow="Loading"
      title="Preparing Pinequest Team 9"
    />
  );
}

export default function Home() {
  if (!hasClerkConfig) {
    return <DashboardShell />;
  }

  return <HomeRedirect />;
}
