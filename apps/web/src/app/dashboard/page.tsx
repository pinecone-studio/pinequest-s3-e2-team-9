"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { SpotlightCard } from "@pinequest/ui";
import { AuthStatusCard, ClerkConfigCard } from "../auth-status-card";

const shortenId = (value: string) => {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 9)}...${value.slice(-6)}`;
};

const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function DashboardContent() {
  const router = useRouter();
  const { isLoaded: isAuthLoaded, userId } = useAuth();

  useEffect(() => {
    if (isAuthLoaded && !userId) {
      router.replace("/sign-in");
    }
  }, [isAuthLoaded, router, userId]);

  if (!isAuthLoaded) {
    return (
      <AuthStatusCard
        description="Verifying your Clerk session before opening the protected dashboard."
        eyebrow="Checking Access"
        title="Loading dashboard"
      />
    );
  }

  if (!userId) {
    return (
      <AuthStatusCard
        description="Redirecting to the login screen because there is no active Clerk session."
        eyebrow="Signed Out"
        title="Dashboard access requires login"
      />
    );
  }

  return (
    <main className="page">
      <SpotlightCard
        eyebrow="Protected Route"
        title="Clerk Dashboard"
        description="This page only renders after the Clerk session is confirmed in the browser. Signed-out users are redirected to the login screen."
      >
        <div className="dashboard-header">
          <div>
            <p className="auth-kicker">Session verified</p>
            <h2 className="auth-heading">Teacher access confirmed</h2>
            <p className="auth-copy">
              This page unlocks as soon as Clerk confirms the browser session.
              Signed-out users are redirected to `/sign-in` immediately.
            </p>
          </div>
          <UserButton />
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <p className="dashboard-label">User ID</p>
            <p className="dashboard-value">{shortenId(userId)}</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-label">Session source</p>
            <p className="dashboard-value">Clerk browser session</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-label">Route status</p>
            <p className="dashboard-value">Protected via Clerk session gate</p>
          </article>
        </div>

        <div className="button-row">
          <Link className="secondary-button" href="/">
            Back to home
          </Link>
          <Link className="ghost-link" href="/sign-in">
            Open sign-in page
          </Link>
        </div>
      </SpotlightCard>
    </main>
  );
}

export default function DashboardPage() {
  if (!hasClerkConfig) {
    return <ClerkConfigCard />;
  }

  return <DashboardContent />;
}
