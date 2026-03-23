import { SpotlightCard } from "@pinequest/ui";

export default function Home() {
  return (
    <main className="page">
      <SpotlightCard
        eyebrow="Monorepo is ready"
        title="Pinequest Team 9"
        description="The Next.js app now lives in apps/web and shares UI from packages/ui."
      >
        <div className="pill-row">
          <span className="pill">apps/web</span>
          <span className="pill">packages/ui</span>
          <span className="pill">npm workspaces</span>
        </div>
      </SpotlightCard>
    </main>
  );
}
