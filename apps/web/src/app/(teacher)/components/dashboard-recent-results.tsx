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
    <article className="h-[312px] w-[362.67px] rounded-[16px] bg-white p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-medium leading-5 text-[#52555B]">Саяхан дууссан</h2>
        <Link className="text-[12px] font-medium leading-4 text-[#6F90FF] transition hover:text-[#3A5FE6]" href="/my-exams">
          Бүгдийг харах
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="mt-10 rounded-[22px] border border-dashed border-[#D8E2F2] bg-[#FBFCFF] px-4 py-8 text-center text-[14px] text-[#667085]">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {results.map((result) => (
            <Link key={result.id} className="rounded-[12px] border border-transparent py-3 transition hover:border-[#E3EAFA] hover:bg-[#FBFCFF]" href={result.href}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-medium leading-5 text-[#0F1216]">{result.title}</p>
                <div className="flex items-center gap-3 text-[12px] font-medium leading-4">
                  <span className="text-[#31AA40]">Тэнцсэн {result.passCount}</span>
                  <span className="text-[#D40924]">Унасан {result.failCount}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[rgba(25,34,48,0.2)]">
                <div className="h-1.5 rounded-full bg-[#192230]" style={{ width: `${result.progressPercent}%` }} />
              </div>
              <p className="mt-2 text-[12px] font-medium leading-4 text-[#6F90FF]">{result.averageScoreLabel}</p>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
