import { ArrowRightIcon, CheckIcon, CloseIcon } from "../icons";

export function RecentSection() {
  return (
    <section className="mt-10 space-y-3 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[#52555B]">
          Сүүлийн шалгалтууд
        </h2>
        <button className="flex items-center gap-1 text-[12px] text-[#555555]">
          Бүгдийг харах <ArrowRightIcon className="h-3 w-3" />
        </button>
      </div>
      <div className="rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-[16px] font-medium text-[#0F1216]">
              Физикийн улирлын шалгалт
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
              <div className="flex items-center gap-2">
                Тэнцсэн хувь
                <div className="h-1.5 w-16 rounded-full bg-[#19223033]">
                  <div className="h-1.5 w-[85%] rounded-full bg-[#192230]" />
                </div>
                <span className="font-medium text-[#0F1216]">85%</span>
              </div>
              <span className="flex items-center gap-1 text-[#31AA40]">
                <CheckIcon className="h-3.5 w-3.5 text-[#31AA40]" />
                20
              </span>
              <span className="flex items-center gap-1 text-[#D40924]">
                <CloseIcon className="h-3.5 w-3.5 text-[#D40924]" />
                4
              </span>
              <span>Дундаж 78%</span>
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
