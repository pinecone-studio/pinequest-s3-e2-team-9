import { ArrowRightIcon, CalendarIcon, UsersIcon } from "../icons";

export function UpcomingSection() {
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-medium text-[#0F1216]">
                Биологийн шалгалт
              </h3>
              <span className="rounded-md border border-[#F63D6B33] bg-[#F63D6B1A] px-2 py-[2px] text-[12px] font-medium text-[#F63D6B]">
                Товлогдсон
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-[12px] text-[#52555B]">
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5" />
                Feb 20, 8:00 AM
              </span>
              <span className="flex items-center gap-2">
                <UsersIcon className="h-3.5 w-3.5" />
                Biology 201
              </span>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#0F1216]">
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
