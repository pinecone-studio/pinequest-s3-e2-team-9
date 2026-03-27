import type { DashboardSummaryCardView } from "./dashboard/dashboard-types";
import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStatsRowProps = {
  cards: DashboardSummaryCardView[];
};

export function DashboardStatsRow({ cards }: DashboardStatsRowProps) {
  return (
    <section className="mx-auto grid h-[190px] w-full max-w-[1120px] justify-center gap-4 lg:grid-cols-[repeat(3,362.67px)]">
      {cards.map((card) => (
        <DashboardStatCard key={card.title} card={card} />
      ))}
    </section>
  );
}
