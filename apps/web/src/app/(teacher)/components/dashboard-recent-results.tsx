import Link from "next/link";
import type { DashboardRecentResultItem } from "./dashboard/dashboard-types";

type DashboardRecentResultsProps = {
  results: DashboardRecentResultItem[];
  emptyMessage: string;
};

export function DashboardRecentResults({
  results,
  emptyMessage,
}: DashboardRecentResultsProps) {
  return (
    <article className="rounded-[28px] border border-[#E8EDF7] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-[#101828]">Саяхан дууссан</h2>
        <Link className="text-[15px] font-medium text-[#5B7CFF] transition hover:text-[#3A5FE6]" href="/my-exams">
          Бүгдийг харах
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="mt-10 rounded-[22px] border border-dashed border-[#D8E2F2] bg-[#FBFCFF] px-4 py-8 text-center text-[14px] text-[#667085]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-7 grid gap-6">
          {results.map((result) => (
            <Link key={result.id} className="rounded-[22px] border border-transparent p-2 transition hover:border-[#E3EAFA] hover:bg-[#FBFCFF]" href={result.href}>
              <div className="flex items-start justify-between gap-4">
                <p className="text-[18px] font-semibold text-[#101828]">{result.title}</p>
                <div className="flex items-center gap-3 text-[14px] font-semibold">
                  <span className="text-[#22A24A]">Тэнцсэн {result.passCount}</span>
                  <span className="text-[#E53949]">Унасан {result.failCount}</span>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#E5E7EB]">
                <div className="h-2 rounded-full bg-[#111827]" style={{ width: `${result.progressPercent}%` }} />
              </div>
              <p className="mt-3 text-[14px] text-[#667085]">{result.averageScoreLabel}</p>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
