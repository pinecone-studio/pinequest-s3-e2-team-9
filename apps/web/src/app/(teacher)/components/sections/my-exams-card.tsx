import CastForEducationIcon from "../icons/CastForEducationIcon";
import HuggingkidsIcon from "../icons/HuggingkidsIcon";
import type { MyExamsSectionMode } from "./my-exams-section-config";
import type { MyExamListView } from "./my-exams-types";

const cardClassName =
  "flex h-[216px] w-[352px] max-w-full flex-none flex-col gap-3 rounded-[16px] border border-[#F1F2F3] bg-white px-[10px] pb-[16px] pt-[10px] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]";

const actionButtonClassName =
  "inline-flex h-[36px] items-center justify-center rounded-[8px] border border-[#52555B] px-0 py-2 text-center text-[12px] font-semibold leading-5 text-[#52555B] transition-colors hover:bg-[#F8FAFC]";

type MyExamCardProps = {
  exam: MyExamListView;
  mode: MyExamsSectionMode;
  onView: () => void;
  onResults: () => void;
};

export function MyExamCard({ exam, mode, onView, onResults }: MyExamCardProps) {
  const showResults = mode === "evaluation" && exam.actions.results;

  return (
    <article className={cardClassName}>
      <div
        className={[
          "flex h-[142px] flex-col gap-[10px] overflow-hidden px-[14px] py-[18px]",
          "rounded-t-[16px] rounded-b-[4px] bg-[#6F90FF]",
        ].join(" ")}
      >
        <h3 className="text-[18px] font-bold leading-5 text-white">
          {exam.title}
        </h3>

        <div className="flex items-center gap-[6px] text-[14px] leading-4 text-[#F5F5F5]">
          <CastForEducationIcon className="block h-4 w-4 shrink-0" />
          <span className="block truncate">{exam.subject}</span>
        </div>

        <div className="flex items-center gap-[6px] text-[14px] leading-4 text-[#F5F5F5]">
          <HuggingkidsIcon className="block h-4 w-4 shrink-0" />
          <span className="block truncate">
            {mode === "library" ? "Хувийн сан" : exam.secondaryLabel}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {[
            exam.questionCountLabel,
            exam.durationLabel,
            exam.totalPointsLabel,
          ].map((item) => (
            <span
              key={`${exam.id}-${item}`}
              className="inline-flex h-6 items-center justify-center rounded-[16px] bg-white px-2 py-1 text-[12px] font-medium leading-4 text-[#0F1216]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`grid w-full gap-[12px] ${showResults ? "sm:grid-cols-2" : ""}`}
      >
        <button
          className={`${actionButtonClassName} ${showResults ? "" : "w-full"}`}
          onClick={onView}
          type="button"
        >
          Дэлгэрэнгүй харах
        </button>

        {showResults ? (
          <button
            className={actionButtonClassName}
            onClick={onResults}
            type="button"
          >
            Үр дүн харах
          </button>
        ) : null}
      </div>
    </article>
  );
}
