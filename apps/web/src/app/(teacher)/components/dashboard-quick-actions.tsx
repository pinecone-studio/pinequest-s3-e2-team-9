import Link from "next/link";
import { CheckCircleIcon, UsersIcon, BookIcon } from "./icons-base";
import { PlusIcon } from "./icons-actions";
import type { DashboardQuickActionView } from "./dashboard/dashboard-types";

type DashboardQuickActionsProps = {
  actions: DashboardQuickActionView[];
};

const iconMap = {
  create: PlusIcon,
  review: CheckCircleIcon,
  classes: UsersIcon,
  bank: BookIcon,
} satisfies Record<DashboardQuickActionView["icon"], typeof PlusIcon>;

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  const [primaryAction, ...secondaryActions] = actions;

  return (
    <article className="rounded-[28px] border border-[#E8EDF7] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <h2 className="text-[18px] font-semibold text-[#101828]">Түргэн үйлдлүүд</h2>

      {primaryAction ? (
        <Link
          className="mt-10 flex h-[58px] items-center justify-center gap-3 rounded-[20px] bg-[linear-gradient(135deg,#7895FF_0%,#5B7CFF_100%)] px-5 text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(91,124,255,0.26)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#DBE6FF]"
          href={primaryAction.href}
        >
          <PlusIcon className="h-5 w-5" />
          {primaryAction.label}
        </Link>
      ) : null}

      <div className="mt-4 grid gap-3">
        {secondaryActions.map((action) => {
          const Icon = iconMap[action.icon];
          return (
            <Link
              key={action.label}
              className="flex min-h-[62px] items-center gap-4 rounded-[20px] border border-[#E4E7EC] bg-white px-4 text-[#101828] shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#C9D9FF] hover:bg-[#F9FBFF] focus:outline-none focus:ring-4 focus:ring-[#E6EDFF]"
              href={action.href}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F6FF] text-[#355DDC]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-[16px] font-semibold">{action.label}</span>
                <span className="mt-0.5 block text-[13px] text-[#667085]">{action.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
