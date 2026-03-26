import Link from "next/link";
import type { DashboardUpcomingExamItem } from "./dashboard/dashboard-types";

type DashboardUpcomingListProps = {
  exams: DashboardUpcomingExamItem[];
  emptyMessage: string;
};

export function DashboardUpcomingList({
  exams,
  emptyMessage,
}: DashboardUpcomingListProps) {
  return (
    <article className="h-[312px] w-[362.67px] rounded-[16px] bg-white p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-medium leading-5 text-[#52555B]">Удахгүй болох</h2>
        <Link className="text-[12px] font-medium leading-4 text-[#6F90FF] transition hover:text-[#3A5FE6]" href="/my-exams">
          Бүгдийг харах
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="mt-10 rounded-[12px] border border-dashed border-[#D8E2F2] bg-[#FBFCFF] px-4 py-8 text-center text-[14px] text-[#667085]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {exams.map((exam) => (
            <Link key={exam.id} className="flex items-center justify-between gap-3 py-3" href={exam.href}>
              <div className="space-y-0.5">
                <p className="text-[14px] font-medium leading-5 text-[#0F1216]">{exam.title}</p>
                <p className="text-[12px] font-medium leading-4 text-[#6F90FF]">{exam.scheduledLabel}</p>
              </div>
              <span className="rounded-lg bg-white/80 px-2.5 py-0.5 text-[12px] font-medium leading-4 text-[#0F1216]">
                {exam.questionCountLabel}
              </span>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
