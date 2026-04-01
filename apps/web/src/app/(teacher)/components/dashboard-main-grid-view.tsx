import Link from "next/link";
import { CreateExamQuickActionIcon, CreateQuestionBankQuickActionIcon, GradeQuickActionIcon, TakeExamQuickActionIcon } from "./dashboard-quick-action-icons";
import type { DashboardQuickActionView, DashboardRecentResultItem, DashboardUpcomingExamItem } from "./dashboard/dashboard-types";
import { ArrowRightIcon } from "./icons";
import { PendingReviewsWidget } from "./pending-reviews-widget";
import { ScoreBreakdownWidget } from "./score-breakdown-widget";

type DashboardMainGridProps = { actions: DashboardQuickActionView[]; pendingReviewCount: number; recentResults: DashboardRecentResultItem[]; searchActive: boolean; upcomingExams: DashboardUpcomingExamItem[] };

const actionIcons = {
  bank: CreateQuestionBankQuickActionIcon,
  classes: TakeExamQuickActionIcon,
  create: CreateExamQuickActionIcon,
  review: GradeQuickActionIcon,
} as const;
const actionWidths: Record<string, string> = {
  "Шалгалт үүсгэх": "w-[175px]",
  "Асуултын сан үүсгэх": "w-[210px]",
  "Шалгалт авах": "w-[161px]",
  "Дүн тавих": "w-[136px]",
};
const cardClassName =
  "rounded-[16px] bg-white shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]";
const buildCalendar = (values: string[]) => {
  const focus = values[0] ? new Date(values[0]) : new Date();
  const month = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = month.getDay();
  return {
    active: new Set(values.map((value) => new Date(value).getDate())),
    days: Array.from({ length: offset + total }, (_, index) => (index < offset ? 0 : index - offset + 1)),
    label: month.toLocaleString("en-US", { month: "long", year: "numeric" }),
    selected: focus.getDate(),
    today: new Date().getMonth() === month.getMonth() ? new Date().getDate() : 0,
  };
};

export function DashboardMainGrid({ actions, pendingReviewCount, recentResults, searchActive, upcomingExams }: DashboardMainGridProps) {
  const calendar = buildCalendar(upcomingExams.map(({ scheduledAt }) => scheduledAt));
  // TODO: Replace this proxy list when backend exposes dedicated pending-review exam items.
  const reviewItems = recentResults.slice(0, 3);

  return (
    <>
      <div className="flex h-10 w-[742px] flex-nowrap gap-5">
        {actions.map((action) => {
          const Icon = actionIcons[action.icon];
          return (
            <Link
              key={action.label}
              className={`inline-flex h-10 items-center justify-start gap-[10px] whitespace-nowrap rounded-[5px] border px-5 py-[10px] text-[14px] leading-[20px] font-[var(--font-inter)] transition ${actionWidths[action.label] ?? "w-auto"} ${
                action.primary
                  ? "border-transparent bg-[#6434F8] text-white"
                  : "border-[#DFE1E5] bg-[#FAFAFA] text-black shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06),0px_0px_0px_4px_#F5F5F5]"
              }`}
              href={action.href}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={`inline-flex items-center whitespace-nowrap text-[14px] leading-[20px] font-[var(--font-inter)] ${
                  action.primary ? "font-semibold text-white" : "font-medium text-black"
                }`}
              >
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex h-[366px] w-[1120px] gap-4">
        <ScoreBreakdownWidget hasResults={recentResults.length > 0} searchActive={searchActive} />

        <PendingReviewsWidget className={cardClassName} pendingReviewCount={pendingReviewCount} reviewItems={reviewItems} searchActive={searchActive} />
      </div>

      <div className="flex w-[552px]">
        <section className={`${cardClassName} flex h-[264px] w-[552px] items-start justify-between gap-[21px] p-[12px]`}>
          <div className="flex h-[226px] w-[306px] flex-col gap-[10px] px-[8px] py-[10px]">
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-[#7A7A7A] font-[var(--font-inter)]">Удахгүй болох шалгалтууд</p>
              <span className="text-[36px] font-medium leading-[42px] text-[#242424] font-[var(--font-inter)]">{upcomingExams.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {(upcomingExams.length ? upcomingExams.slice(0, 3) : []).map((exam) => (
                <Link key={exam.id} href={exam.href} className="flex flex-col gap-1 border-b border-[#DFE1E5] border-b-[0.5px] pb-[4px]">
                  <span className="text-[12px] font-medium text-[#0F1216] font-[var(--font-geist)]">{exam.title}</span>
                  <span className="text-[12px] font-medium text-[#0F1216] font-[var(--font-geist)]">{exam.questionCountLabel}</span>
                  <span className="text-[12px] font-medium text-[#6434F8] font-[var(--font-geist)]">{exam.scheduledLabel}</span>
                </Link>
              ))}
              {!upcomingExams.length ? (
                <p className="text-[12px] text-[#8B879A]">{searchActive ? "Хайлтад тохирох товлосон шалгалт олдсонгүй." : "Одоогоор удахгүй болох шалгалт алга."}</p>
              ) : null}
            </div>
          </div>

          <div className="flex h-[226px] w-[222px] flex-col items-center justify-center gap-[9.6px] rounded-[9.6px] border border-[#E4E4E4] bg-white px-[4.8px] py-[19.2px] shadow-[0_12px_16px_-4px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex w-full items-center justify-between px-4">
              <button aria-label="Өмнөх сар" className="text-[#222222]">
                <ArrowRightIcon className="h-[8.3px] w-[4.15px] rotate-180" />
              </button>
              <span className="text-[10px] font-semibold text-[#6434F8] font-[var(--font-inter)]">{calendar.label}</span>
              <button aria-label="Дараагийн сар" className="text-[#222222]">
                <ArrowRightIcon className="h-[8.3px] w-[4.15px]" />
              </button>
            </div>
            <div className="grid w-full grid-cols-7 gap-1 px-4 text-center text-[7px] font-medium uppercase tracking-[0.03em] text-[#AAAAAA] font-[var(--font-inter)]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid w-full grid-cols-7 gap-1 px-4">
              {calendar.days.map((day, index) => {
                const isActive = day > 0 && calendar.active.has(day);
                return (
                  <div
                    key={`${day}-${index}`}
                    className={`flex h-[24.9px] w-[24.9px] items-center justify-center text-[9px] font-medium font-[var(--font-poppins)] ${
                      day === 0
                        ? "text-transparent"
                        : isActive
                        ? "rounded-full bg-[#6434F8] text-white"
                        : "text-[#222222]"
                    }`}
                  >
                    {day || "."}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
