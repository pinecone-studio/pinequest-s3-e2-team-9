"use client";

import {
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
  MCQ: "Олон сонголт",
  TRUE_FALSE: "Үнэн/Худал",
  SHORT_ANSWER: "Тоо бодолт",
  ESSAY: "Задгай",
  IMAGE_UPLOAD: "Зураг",
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
      Олон сонголт
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
          className="rounded-[12px] border border-[#DFE1E5] bg-white p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-[14px] leading-5">
                <span className="text-[14px] font-medium leading-5 text-[#0F1216]">
                  Асуулт {index + 1}
                </span>
                <span className="text-[16px] leading-6 text-[#52555B]">—</span>
                <span className="text-[14px] font-semibold leading-5 text-[#6F90FF]">
                  {selectedQuestionPoints[question.id] ?? "1"} оноо
                </span>
              </div>

              <p className="text-[14px] leading-[23px] text-[#52555B]">{promptFor(question)}</p>

              <div className="flex flex-wrap items-center gap-[6px]">
                {question.type === "MCQ" ? (
                  <McqBadge />
                ) : (
                  <span className="rounded-[6px] border border-[#D0D5DD] bg-white px-[5.8px] py-[0.62px] text-[12px] font-medium leading-4 text-[#0F1216]">
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
                  {question.difficulty === "EASY"
                    ? "Хялбар"
                    : question.difficulty === "MEDIUM"
                      ? "Дунд"
                      : question.difficulty === "HARD"
                        ? "Хүнд"
                        : question.difficulty}
                </span>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 xl:w-auto xl:min-w-[220px]">
              <div className="flex items-start justify-between gap-3 xl:justify-end">
                <div className="rounded-[12px] border border-[rgba(111,144,255,0.3)] bg-[rgba(111,144,255,0.05)] p-4 xl:min-w-[220px]">
                  <p className="text-[12px] font-medium leading-4 text-[#0F1216]">
                    Энэ асуултын оноо
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedQuestionPoints[question.id] ?? ""}
                      onChange={(event) => onPointsChange(question.id, event.target.value)}
                      disabled={disabled}
                      inputMode="numeric"
                      className="h-10 w-24 rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-center text-[18px] font-semibold leading-6 text-[#0F1216] shadow-[0px_1px_2px_rgba(16,24,40,0.05)] outline-none"
                    />
                    <span className="text-[14px] leading-5 text-[#52555B]">оноо</span>
                  </div>
                  {errors.pointsByQuestionId[question.id] ? (
                    <p className="mt-3 text-[12px] text-[#B42318]">
                      {errors.pointsByQuestionId[question.id]}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 pt-1 text-[#52555B]">
                  <button type="button" className="disabled:opacity-40" disabled>
                    <PreviewPencilIcon className="h-5 w-5" />
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
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
