import type { DashboardSummaryCardView } from "./dashboard/dashboard-types";
import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStatsRowProps = {
  cards: DashboardSummaryCardView[];
};

export function DashboardStatsRow({ cards }: DashboardStatsRowProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      {cards.map((card) => (
        <DashboardStatCard key={card.title} card={card} />
      ))}
    </section>
  );
}
