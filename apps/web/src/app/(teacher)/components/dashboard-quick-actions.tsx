import Link from "next/link";
import { PlusIcon } from "./icons-actions";
import {
  CheckExamIcon,
  ClassManagementIcon,
  QuestionBoxIcon,
} from "./icons-ui";
import type { DashboardQuickActionView } from "./dashboard/dashboard-types";

type DashboardQuickActionsProps = {
  actions: DashboardQuickActionView[];
};

const iconMap = {
  create: PlusIcon,
  review: CheckExamIcon,
  classes: ClassManagementIcon,
  bank: QuestionBoxIcon,
} satisfies Record<DashboardQuickActionView["icon"], typeof PlusIcon>;

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  const [primaryAction, ...secondaryActions] = actions;

  return (
    <article className="h-[312px] w-[362.67px] rounded-[16px] bg-white py-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="px-6 pb-5">
        <h2 className="text-[14px] font-medium leading-5 text-[#52555B]">Түргэн үйлдлүүд</h2>
      </div>

      <div className="flex flex-col gap-2 px-6">
        {primaryAction ? (
          <Link
            className="flex h-11 items-center gap-5 rounded-[12px] bg-[#6F90FF] px-3 text-[14px] font-medium leading-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            href={primaryAction.href}
          >
            <PlusIcon className="h-4 w-4" />
            {primaryAction.label}
          </Link>
        ) : null}

        {secondaryActions.map((action) => {
          const Icon = iconMap[action.icon];
          return (
            <Link
              key={action.label}
              className="flex h-11 items-center gap-5 rounded-[12px] border border-[#DFE1E5] bg-[#FAFAFA] px-3 text-[#0F1216] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              href={action.href}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[14px] font-medium leading-5">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
