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
    <article className="rounded-[28px] border border-[#E8EDF7] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-[#101828]">Удахгүй болох</h2>
        <Link className="text-[15px] font-medium text-[#5B7CFF] transition hover:text-[#3A5FE6]" href="/my-exams">
          Бүгдийг харах
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="mt-10 rounded-[22px] border border-dashed border-[#D8E2F2] bg-[#FBFCFF] px-4 py-8 text-center text-[14px] text-[#667085]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-7 grid gap-5">
          {exams.map((exam) => (
            <Link key={exam.id} className="rounded-[22px] border border-transparent p-2 transition hover:border-[#E3EAFA] hover:bg-[#FBFCFF]" href={exam.href}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[18px] font-semibold text-[#101828]">{exam.title}</p>
                  <p className="mt-2 text-[15px] text-[#5B7CFF]">{exam.scheduledLabel}</p>
                </div>
                <span className="rounded-full bg-[#F3F6FF] px-3 py-1 text-[14px] font-semibold text-[#355DDC]">
                  {exam.questionCountLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
