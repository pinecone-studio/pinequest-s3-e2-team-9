"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { SpotlightCard } from "@pinequest/ui";
import { AuthStatusCard, ClerkConfigCard } from "../auth-status-card";

const getDisplayName = (
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
) => {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || username || "Clerk user";
};

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
  const { isLoaded: isUserLoaded, user } = useUser();

  useEffect(() => {
    if (isAuthLoaded && !userId) {
      router.replace("/sign-in");
    }
  }, [isAuthLoaded, router, userId]);

  if (!isAuthLoaded || !isUserLoaded) {
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

  const displayName = getDisplayName(
    user?.firstName,
    user?.lastName,
    user?.username,
  );
  const email = user?.emailAddresses[0]?.emailAddress ?? "No email found";

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
            <h2 className="auth-heading">{displayName}</h2>
            <p className="auth-copy">
              Clerk is supplying the active user session on the client and the
              route stays locked until a valid login exists. If a user is not
              logged in, they are redirected to `/sign-in`.
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
            <p className="dashboard-label">Primary email</p>
            <p className="dashboard-value">{email}</p>
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
