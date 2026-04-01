import { ArrowDownIcon } from "./icons-more";

type ScoreBreakdownWidgetProps = {
  hasResults: boolean;
  searchActive: boolean;
};

const scoreYAxis = ["80-100%", "60-80%", "40-60%", "20-40%", "10-20%"] as const;
const scoreXAxisLabels = ["0-19 (F)", "20-59 (F)", "60 (D)", "70-79 (C)", "80-100 (B-A)"] as const;
const scoreBarHeights = [106, 140, 55, 106, 106];

export function ScoreBreakdownWidget({ hasResults, searchActive }: ScoreBreakdownWidgetProps) {
  return (
    <section className="h-[366px] w-[442px] rounded-[16px] bg-white p-[28px] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex h-[70px] w-[386px] justify-between">
        <div className="flex h-[70px] w-[269px] flex-col justify-between gap-[8px]">
          <p className="text-[14px] font-medium leading-[18px] tracking-[-0.5px] text-[#7A7A7A] font-[var(--font-inter)]">
            Сурагчдын онооны хуваарилалт
          </p>
          <h2 className="text-[36px] font-medium leading-[42px] tracking-[-2px] text-[#242424] font-[var(--font-inter)]">
            Онооны задрал
          </h2>
        </div>
        <div className="flex h-[70px] w-[117px] flex-col items-end justify-between">
          <div className="flex h-[30px] w-[117px] items-center gap-[8px] rounded-[8px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.002)] px-[8px] text-[12px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-[var(--font-geist)]">
            <span className="w-[75px] text-center">Бүх шалгалт</span>
            <ArrowDownIcon className="h-4 w-4 text-[#0A0A0A]" />
          </div>
          <div className="flex h-[30px] w-[93px] items-center gap-[8px] rounded-[8px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.002)] px-[8px] text-[12px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-[var(--font-geist)]">
            <span className="w-[51px] text-center whitespace-nowrap">Бүх Анги</span>
            <ArrowDownIcon className="h-4 w-4 text-[#0A0A0A]" />
          </div>
        </div>
      </div>

      {hasResults ? (
        <div className="relative mt-[40px] h-[200px] w-[386px]">
          <div className="absolute left-0 top-0 w-[69px] text-[10px] font-medium leading-[14px] tracking-[-0.5px] text-[rgba(100,52,248,0.6)] font-[var(--font-inter)]">
            Нийт Сурагчид
          </div>
          <div className="mt-[12px] flex h-[174px] w-[386px] items-center justify-between">
            <div className="flex h-[174px] w-[41px] flex-col justify-between text-[10px] font-semibold leading-[14px] tracking-[-0.5px] text-[#464646] font-[var(--font-inter)]">
              {scoreYAxis.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="relative h-[174px] w-[313px]">
              <div className="absolute inset-0 flex flex-col justify-between gap-[42px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="h-px w-full border-b border-dashed border-[#CCCCCC] opacity-40" />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex h-[172px] items-end justify-center gap-[34px]">
                {scoreBarHeights.map((height, index) => (
                  <div key={scoreXAxisLabels[index]} className="flex w-[27px] items-end justify-center">
                    <div className="relative w-[27px]" style={{ height: `${height}px` }}>
                      <div className="absolute inset-0 rounded-[6px] bg-[#F6F4FE]" />
                      <div className="absolute inset-0 rounded-[4px] bg-[linear-gradient(179.8deg,rgba(100,52,248,0.2)_0.17%,#6434F8_75.27%)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-[12px] flex w-[386px] items-start">
            <div className="w-[41px]" />
            <div className="relative flex w-[313px] items-start justify-center gap-[34px] text-[10px] font-medium leading-[14px] tracking-[-0.5px] text-[#000] font-[var(--font-inter)]">
              <span className="absolute -left-[38px] top-0 text-[10px] font-medium tracking-[-0.5px] text-[rgba(100,52,248,0.6)]">
                Дүн
              </span>
              {scoreXAxisLabels.map((label) => (
                <span key={label} className="w-[27px] text-center whitespace-nowrap font-semibold">{label}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-[40px] rounded-[20px] bg-[#FAF8FF] px-4 py-8 text-center text-[14px] text-[#8B879A]">
          {searchActive ? "Хайлтад тохирох онооны мэдээлэл алга." : "Одоогоор онооны хуваарилалт хараахан бүрдээгүй байна."}
        </p>
      )}
    </section>
  );
}
