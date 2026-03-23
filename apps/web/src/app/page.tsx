import { SpotlightCard } from "@pinequest/ui";

export default function Home() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  return (
    <main className="page">
      <SpotlightCard
        eyebrow="Monorepo is ready"
        title="Pinequest Team 9"
        description={`The Next.js app now lives in apps/web and talks to ${apiBaseUrl}.`}
      >
        <div className="pill-row">
          <span className="pill">apps/web</span>
          <span className="pill">packages/ui</span>
          <span className="pill">npm workspaces</span>
          <span className="pill">api via env</span>
        </div>
        <div className="pill-row">
          <a
            className="pill"
            href={`${apiBaseUrl}/health`}
            rel="noreferrer"
            target="_blank"
          >
            API health
          </a>
          <a
            className="pill"
            href={`${apiBaseUrl}/api/hello`}
            rel="noreferrer"
            target="_blank"
          >
            API hello
          </a>
        </div>
      </SpotlightCard>
    </main>
  );
}
