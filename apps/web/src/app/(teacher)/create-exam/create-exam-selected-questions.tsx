"use client";

import {
  PreviewFileIcon,
  PreviewPencilIcon,
  PreviewTrashIcon,
} from "../components/icons";
import type {
  CreateExamFieldErrors,
  CreateExamQuestionOption,
  SelectedQuestionPoints,
} from "./create-exam-types";

type CreateExamSelectedQuestionsProps = {
  questionOptions: CreateExamQuestionOption[];
  selectedQuestionPoints: SelectedQuestionPoints;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onRemove: (questionId: string) => void;
  onPointsChange: (questionId: string, value: string) => void;
};

const TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ",
  TRUE_FALSE: "True/False",
  SHORT_ANSWER: "Numeric",
  ESSAY: "Essay",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "border border-[rgba(49,170,64,0.2)] bg-[rgba(49,170,64,0.1)] text-[#31AA40]",
  MEDIUM: "border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.1)] text-[#D97706]",
  HARD: "border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] text-[#DC2626]",
};

function McqBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#DFE1E5] px-[5.8px] py-[0.62px] text-[12px] font-medium leading-4 text-[#0F1216]">
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.5 4.2 8.7 10 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" />
      </svg>
      MCQ
    </span>
  );
}

const promptFor = (question: CreateExamQuestionOption) =>
  (question.prompt.trim() || question.title.trim()).slice(0, 160);

export function CreateExamSelectedQuestions({
  questionOptions,
  selectedQuestionPoints,
  errors,
  disabled,
  onRemove,
  onPointsChange,
}: CreateExamSelectedQuestionsProps) {
  const selectedQuestions = questionOptions.filter(
    (question) => question.id in selectedQuestionPoints,
  );

  if (!selectedQuestions.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {selectedQuestions.map((question, index) => (
        <article
          key={question.id}
          className="flex items-start gap-4 rounded-[12px] border border-[#DFE1E5] bg-white p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
        >
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[14px] leading-5">
                <span className="font-medium text-[#0F1216]">Question {index + 1}</span>
                <span className="text-[16px] leading-6 text-[#52555B]">—</span>
                <label className="inline-flex items-center gap-1 font-semibold text-[#6F90FF]">
                  <input
                    type="text"
                    value={selectedQuestionPoints[question.id] ?? ""}
                    onChange={(event) => onPointsChange(question.id, event.target.value)}
                    disabled={disabled}
                    inputMode="numeric"
                    className="w-8 bg-transparent text-right outline-none"
                  />
                  <span>pts</span>
                </label>
              </div>
              <p className="text-[14px] leading-[23px] text-[#52555B]">{promptFor(question)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-[6px]">
              {question.type === "MCQ" ? (
                <McqBadge />
              ) : (
                <span className="rounded-[6px] border border-[#DFE1E5] px-[5.8px] py-[0.62px] text-[12px] font-medium leading-4 text-[#0F1216]">
                  {TYPE_LABELS[question.type] ?? question.type}
                </span>
              )}
              <span className="rounded-[6px] bg-[#6F90FF] px-[5.8px] py-[0.62px] text-[12px] font-medium leading-4 text-white">
                {question.bankSubject}
              </span>
              <span
                className={[
                  "rounded-[6px] px-[5.8px] py-[0.62px] text-[12px] font-medium leading-4 capitalize",
                  DIFFICULTY_STYLES[question.difficulty] ??
                    "border border-[#DFE1E5] bg-white text-[#52555B]",
                ].join(" ")}
              >
                {question.difficulty.toLowerCase()}
              </span>
            </div>

            {errors.pointsByQuestionId[question.id] ? (
              <p className="text-[12px] text-[#B42318]">
                {errors.pointsByQuestionId[question.id]}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 text-[#52555B]">
            <button type="button" className="disabled:opacity-40" disabled>
              <PreviewPencilIcon className="h-5 w-5" />
            </button>
            <button type="button" className="disabled:opacity-40" disabled>
              <PreviewFileIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="disabled:opacity-40"
              onClick={() => onRemove(question.id)}
              disabled={disabled}
            >
              <PreviewTrashIcon className="h-5 w-5" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
