import Link from "next/link";
import { AlertIcon, ArrowRightIcon } from "./icons-actions";
import { CalendarIcon, GridIcon } from "./icons-base";
import type { DashboardSummaryCardView } from "./dashboard/dashboard-types";

type DashboardStatCardProps = {
  card: DashboardSummaryCardView;
};

const iconMap = {
  review: AlertIcon,
  draft: GridIcon,
  schedule: CalendarIcon,
} satisfies Record<DashboardSummaryCardView["icon"], typeof AlertIcon>;

export function DashboardStatCard({ card }: DashboardStatCardProps) {
  const Icon = iconMap[card.icon];

  return (
    <article className="rounded-[28px] border border-[#E8EDF7] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full border border-[#D9E3F6] bg-[#FBFCFE] px-3 py-1 text-[14px] font-medium text-[#344054]">
          {card.title}
        </span>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9E3F6] bg-[#FBFCFE] text-[#101828]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-7 text-[44px] font-bold leading-none tracking-[-0.04em] text-[#101828]">
        {card.value}
      </p>
      <p className="mt-4 min-h-[28px] text-[15px] text-[#667085]">{card.subtitle}</p>

      <Link
        className="mt-7 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7895FF_0%,#5B7CFF_100%)] px-4 text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(91,124,255,0.26)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#DBE6FF]"
        href={card.href}
      >
        {card.actionLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}
