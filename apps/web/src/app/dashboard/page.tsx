"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { AuthStatusCard } from "../auth-status-card";
import { DashboardShell } from "../components/dashboard-shell";

const getDisplayName = (
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
) => {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || username || "Clerk user";
};

const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function ProtectedDashboard() {
  const router = useRouter();
  const { isLoaded: isAuthLoaded, signOut, userId } = useAuth();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const displayName = getDisplayName(
    user?.firstName,
    user?.lastName,
    user?.username,
  );
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "Loading email...";

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut({ redirectUrl: "/sign-in" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DashboardShell
      banner={
        <section className="flex flex-col gap-4 rounded-xl border border-[#D0D5DD] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#12664F]">
              Clerk session
            </p>
            <p className="mt-1 text-[16px] font-semibold text-[#0F1216]">
              {displayName}
            </p>
            <p className="mt-1 text-[13px] text-[#52555B]">{email}</p>
          </div>
          <button
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0F4C3B] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#12664F] disabled:cursor-wait disabled:opacity-70"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </section>
      }
    />
  );
}

export default function DashboardPage() {
  if (!hasClerkConfig) {
    return <DashboardShell />;
  }

  return <ProtectedDashboard />;
}
