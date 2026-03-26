"use client";

import { CloseIcon } from "../icons";
import {
  formatQuestionAnswer,
  formatTolerance,
  type QuestionBankQuestionRow,
} from "../question-bank-utils";

export function QuestionBankQuestionPreviewDialog({
  row,
  onClose,
}: {
  row: QuestionBankQuestionRow | null;
  onClose: () => void;
}) {
  if (!row) {
    return null;
  }

  const tolerance = formatTolerance(row.tags);
  const answer = formatQuestionAnswer(row);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-semibold text-[#0F1216]">{row.text}</h3>
            <p className="mt-1 text-[14px] text-[#52555B]">
              {row.type} · {row.difficulty}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-[#52555B] hover:bg-white"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 text-[14px] text-[#0F1216]">
          <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
            <p className="mb-2 text-[12px] font-medium text-[#52555B]">Асуулт</p>
            <p>{row.prompt || row.text}</p>
          </section>
          {row.rawType === "MCQ" ? (
            <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <p className="mb-2 text-[12px] font-medium text-[#52555B]">Сонголтууд</p>
              <div className="space-y-2">
                {row.options.map((option, index) => (
                  <div
                    key={`${row.id}-${option}-${index}`}
                    className={`rounded-md border px-3 py-2 ${
                      option === row.correctAnswer
                        ? "border-[#31AA4033] bg-[#31AA401A] text-[#0F1216]"
                        : "border-[#DFE1E5]"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
            <p className="mb-2 text-[12px] font-medium text-[#52555B]">Хариулт</p>
            <p>{answer}</p>
            {tolerance ? (
              <p className="mt-2 text-[12px] text-[#52555B]">Хүлцэл: {tolerance}</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
