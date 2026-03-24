import Link from "next/link";
import { SpotlightCard } from "@pinequest/ui";

type AuthStatusCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AuthStatusCard({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: AuthStatusCardProps) {
  return (
    <main className="page">
      <SpotlightCard
        eyebrow={eyebrow}
        title={title}
        description={description}
      >
        {actionHref && actionLabel ? (
          <div className="spotlight-actions">
            <Link className="primary-button" href={actionHref}>
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </SpotlightCard>
    </main>
  );
}

export function ClerkConfigCard() {
  return (
    <AuthStatusCard
      actionHref="/"
      actionLabel="Back to home"
      description="Clerk publishable key is missing in this build. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to the web app environment so preview login can load."
      eyebrow="Preview Config"
      title="Clerk login is not configured for this deploy"
    />
  );
}
