import {
  ChartIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  DotsIcon,
  EyeIcon,
  UsersIcon,
} from "../icons";
import type { MyExamView } from "./my-exams-types";

const baseCard =
  "rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]";

const actionButton =
  "inline-flex items-center gap-2 rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-3 py-1.5 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";

export function MyExamCard({
  exam,
  onView,
  onResults,
}: {
  exam: MyExamView;
  onView: () => void;
  onResults: () => void;
}) {
  const cardClass = exam.highlight
    ? `${baseCard} ring-2 ring-[#3B82F6]`
    : baseCard;

  return (
    <article className={cardClass}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-medium text-[#0F1216]">
              {exam.title}
            </h3>
            <span
              className={`rounded-md border px-2 py-[2px] text-[12px] font-medium ${exam.status.tone}`}
            >
              {exam.status.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#52555B]">
            {exam.meta.map((item) => (
              <span
                key={`${exam.id}-${item.text}`}
                className={`flex items-center gap-2 ${item.tone ?? ""}`}
              >
                {item.icon ? <item.icon className="h-3.5 w-3.5" /> : null}
                {item.text}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {exam.actions.view ? (
            <button className={`${actionButton} cursor-pointer`} onClick={onView} type="button">
              <EyeIcon className="h-4 w-4" />
              Харах
            </button>
          ) : null}
          {exam.actions.results ? (
            <button className={`${actionButton} cursor-pointer`} onClick={onResults} type="button">
              <ChartIcon className="h-4 w-4" />
              Үр дүн
            </button>
          ) : null}
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#0F1216] hover:bg-[#F0F2F5]"
            type="button"
          >
            <DotsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {exam.footer ? (
        <div className="mt-4 border-t border-[#DFE1E5] pt-4">
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#52555B]">
            <span className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              <span className="font-medium text-[#0F1216]">
                {exam.footer.students}
              </span>
              сурагч
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="font-medium text-[#0F1216]">
                {exam.footer.submitted}
              </span>
              илгээсэн
            </span>

            {exam.footer.type === "summary" ? (
              <>
                <div className="min-w-[220px] flex-1 space-y-2">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-[#52555B]">Тэнцсэн хувь</span>
                    <span className="font-medium text-[#0F1216]">
                      {exam.footer.passRate}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#19223033]">
                    <div
                      className="h-2 rounded-full bg-[#192230]"
                      style={{ width: `${exam.footer.passRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-2 text-[#31AA40]">
                    <CheckIcon className="h-4 w-4" />
                    {exam.footer.passed} тэнцсэн
                  </span>
                  <span className="flex items-center gap-2 text-[#D40924]">
                    <CloseIcon className="h-4 w-4" />
                    {exam.footer.failed} унасан
                  </span>
                </div>
                <span className="flex items-center gap-2 text-[#52555B]">
                  <ChartIcon className="h-4 w-4" />
                  Дундаж
                  <span className="font-medium text-[#0F1216]">
                    {exam.footer.average}%
                  </span>
                </span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
