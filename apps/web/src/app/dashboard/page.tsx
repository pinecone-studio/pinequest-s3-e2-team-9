import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SpotlightCard } from "@pinequest/ui";

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

export default async function DashboardPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const user = await currentUser();
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
        description="This page is protected by Clerk proxy middleware and does not render for signed-out users."
      >
        <div className="dashboard-header">
          <div>
            <p className="auth-kicker">Session verified</p>
            <h2 className="auth-heading">{displayName}</h2>
            <p className="auth-copy">
              Clerk is supplying user context on the server and the route stays
              locked until a valid session exists. If a user is not logged in,
              they are redirected to `/sign-in`.
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
            <p className="dashboard-value">Protected via Clerk auth middleware</p>
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
