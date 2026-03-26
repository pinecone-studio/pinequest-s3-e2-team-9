import Link from "next/link";
import { ArrowRightIcon } from "./icons-actions";
import { CalendarIcon, FileIcon, PencilIcon } from "./icons-ui";
import type { DashboardSummaryCardView } from "./dashboard/dashboard-types";

type DashboardStatCardProps = {
  card: DashboardSummaryCardView;
};

export function DashboardStatCard({ card }: DashboardStatCardProps) {
  const iconMap = {
    review: FileIcon,
    draft: PencilIcon,
    schedule: CalendarIcon,
  } satisfies Record<DashboardSummaryCardView["icon"], typeof FileIcon>;
  const Icon = iconMap[card.icon];

  return (
    <article className="flex h-[190px] w-[362.67px] flex-col justify-center rounded-[16px] border border-[#DFE1E5] bg-white p-5 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-lg border border-[#DFE1E5] px-2 py-1 text-[12px] font-medium text-[#0F1216]">
          {card.title}
        </span>
        <Icon className="h-5 w-5 text-[#0F1216]" />
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[30px] font-bold leading-[36px] text-[#0F1216]">
          {card.value}
        </p>
        <p className="text-[14px] leading-5 text-[#52555B]">{card.subtitle}</p>
      </div>

      <Link
        className="mt-4 flex h-8 items-center justify-center gap-2 rounded-[12px] bg-[#6F90FF] px-3 text-[14px] font-medium text-[#F6F9FC] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#DBE6FF]"
        href={card.href}
      >
        {card.actionLabel}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}
