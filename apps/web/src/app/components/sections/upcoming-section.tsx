import { ArrowRightIcon, CalendarIcon, UsersIcon } from "../icons";
import type { UpcomingExamView } from "../dashboard/dashboard-types";

type UpcomingSectionProps = {
  exams: UpcomingExamView[];
};

export function UpcomingSection({ exams }: UpcomingSectionProps) {
  return (
    <section className="mt-10 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[#52555B]">
          Удахгүй болох шалгалтууд
        </h2>
        <button className="flex items-center gap-1 text-[12px] text-[#555555]">
          Бүгдийг харах <ArrowRightIcon className="h-3 w-3" />
        </button>
      </div>
      <div className="rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-card">
        {exams.length === 0 ? (
          <p className="text-[13px] text-[#667085]">
            Ноорог (upcoming) шалгалт одоогоор байхгүй байна.
          </p>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#EAECF0] p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[16px] font-medium text-[#0F1216]">
                      {exam.title}
                    </h3>
                    <span className="rounded-md border border-[#F63D6B33] bg-[#F63D6B1A] px-2 py-[2px] text-[12px] font-medium text-[#F63D6B]">
                      {exam.statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[12px] text-[#52555B]">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {exam.createdAtLabel}
                    </span>
                    <span className="flex items-center gap-2">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {exam.className}
                    </span>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216]">
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
