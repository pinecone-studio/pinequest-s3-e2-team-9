import Link from "next/link";
import {
  ClockIcon,
  DetailsIcon,
  PreviewPencilIcon,
  QuestionBoxIcon,
} from "../icons";
import type { MyExamsSectionMode } from "./my-exams-section-config";
import type { MyExamListView } from "./my-exams-types";

type MyExamCardProps = {
  exam: MyExamListView;
  mode: MyExamsSectionMode;
  onView: () => void;
  onResults: () => void;
};

function ExamCardIllustration() {
  return (
    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[4px] bg-[#FFD56C]">
      <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
        <path
          d="m15 9 12 7-5 8-12-7 5-8Z"
          stroke="#362F57"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        <path
          d="m18 23 14-6 6 13-14 6-6-13Z"
          fill="#FFBC1F"
          stroke="#362F57"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        <path
          d="m11 27 14-6 6 13-14 6-6-13Z"
          fill="#fff"
          stroke="#362F57"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
      </svg>
    </div>
  );
}

export function MyExamCard({ exam, mode, onView, onResults }: MyExamCardProps) {
  const resolvedSubject = exam.subjectName || exam.subject;
  const levelLabel = `${exam.classGrade}-р анги`;
  const durationLabel = exam.durationLabel.replace("минут", "мин");
  const showResults = mode === "evaluation" && exam.actions.results;
  const canEdit = mode === "library" && exam.actions.edit;
  const returnTo = mode === "evaluation" ? "/evaluation" : "/my-exams";
  const editHref = `/create-exam?${new URLSearchParams({
    examId: exam.id,
    returnTo,
  }).toString()}`;
  const primaryClassName =
    "inline-flex h-8 items-center justify-center gap-1 rounded-[4px] bg-[#6434F8] px-4 text-[10px] font-semibold text-white transition hover:bg-[#5628E8]";
  const secondaryClassName =
    "inline-flex h-8 items-center justify-center gap-1 rounded-[4px] bg-[#FDF1ED] px-4 text-[10px] font-medium text-[#6434F8] transition hover:bg-[#F9E5DF]";

  return (
    <article className="flex h-[215px] w-[268px] max-w-full flex-none flex-col gap-4 rounded-[6px] border border-[#E4E4E4] bg-white p-3 shadow-[0px_3.22px_4.83px_rgba(0,0,0,0.09)]">
      <div className="relative flex h-24 items-center gap-3 overflow-hidden rounded-[4px] border border-[#F7E8C5] bg-[#FFF9EE] px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#F5E8C5_1px,transparent_1.2px)] [background-size:12px_12px] opacity-70" />
        <div className="relative shrink-0">
          <ExamCardIllustration />
        </div>
        <div className="relative min-w-0">
          <p className="truncate text-[14px] font-bold leading-[1.2] text-[#D8A028]">
            {resolvedSubject}
          </p>
        </div>
        <span className="absolute right-[10px] top-[8px] rounded-[8px] border border-[#8B2CF5] bg-[#F3E8FF] px-2 py-1 text-[10px] font-semibold leading-3 text-[#7A1AE6]">
          {resolvedSubject}, {levelLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[10px]">
        <div className="space-y-[10px]">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-[17px] text-[#211C37]">
            {exam.title}
          </h3>
          <div className="flex items-center gap-[14px] text-[10px] text-[#1C1D1D]">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {durationLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <QuestionBoxIcon className="h-3 w-3" />
              {exam.questionCount} асуулт
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3">
          {canEdit ? (
            <Link className={primaryClassName} href={editHref}>
              <PreviewPencilIcon className="h-3 w-3" />
              Засах
            </Link>
          ) : (
            <button
              className={primaryClassName}
              onClick={onView}
              type="button"
            >
              <DetailsIcon className="h-3 w-3" />
              Харах
            </button>
          )}

          {showResults ? (
            <button
              className={secondaryClassName}
              onClick={onResults}
              type="button"
            >
              <DetailsIcon className="h-3 w-3" />
              Үр дүн
            </button>
          ) : (
            <button
              className={secondaryClassName}
              onClick={onView}
              type="button"
            >
              <DetailsIcon className="h-3 w-3" />
              Дэлгэрэнгүй
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
