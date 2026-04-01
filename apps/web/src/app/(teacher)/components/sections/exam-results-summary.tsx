import { CheckCirclesIcon, CloseIcon, DetailsIcon } from "../icons";
import type { ExamFooterData } from "./my-exams-types";

export function ExamResultsSummary({
  footer,
  onOpenReport,
}: {
  footer: ExamFooterData | undefined;
  onOpenReport: () => void;
}) {
  const summaryStats = [
    { value: footer?.students ?? 0, label: "Нийт сурагч", tone: "#0F1216" },
    { value: footer?.submitted ?? 0, label: "Илгээсэн", tone: "#0F1216" },
    {
      value: footer?.type === "summary" ? `${footer.passRate}%` : "-",
      label: "Тэнцсэн хувь",
      tone: "#31AA40",
    },
    {
      value: footer?.type === "summary" ? `${footer.average}%` : "-",
      label: "Дундаж оноо",
      tone: "#0F1216",
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onOpenReport}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F9FAFB]"
        >
          <DetailsIcon className="h-4 w-4" />
          Тайлан
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[#DFE1E5] bg-white px-4 py-3 text-center"
          >
            <div className="text-[24px] font-semibold" style={{ color: stat.tone }}>
              {stat.value}
            </div>
            <div className="text-[12px] text-[#52555B]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#DFE1E5] bg-white p-4">
        <h3 className="text-[14px] font-medium text-[#0F1216]">
          Гүйцэтгэлийн задаргаа
        </h3>
        <div className="mt-3 space-y-2 text-[14px] text-[#0F1216]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCirclesIcon className="h-4 w-4 text-[#31AA40]" />
              Тэнцсэн
            </span>
            <span className="font-medium text-[#31AA40]">
              {footer?.type === "summary" ? footer.passed : 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#D40924] text-[#D40924]">
                <CloseIcon className="h-2.5 w-2.5" />
              </span>
              Унасан
            </span>
            <span className="font-medium text-[#D40924]">
              {footer?.type === "summary" ? footer.failed : 0}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-[14px]">
          <div className="flex items-center justify-between text-[#52555B]">
            <span>Тэнцсэн хувь</span>
            <span className="font-medium text-[#0F1216]">
              {footer?.type === "summary" ? `${footer.passRate}%` : "-"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#19223033]">
            <div
              className="h-2 rounded-full bg-[#192230]"
              style={{
                width:
                  footer?.type === "summary" ? `${footer.passRate}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
