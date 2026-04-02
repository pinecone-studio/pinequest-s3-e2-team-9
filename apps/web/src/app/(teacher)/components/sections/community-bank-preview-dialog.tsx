"use client";
import { useQuestionBankDetailQueryQuery } from "@/graphql/generated";
import {
  buildQuestionBankRows,
  formatQuestionAnswer,
  formatTolerance,
} from "../question-bank-utils";

type CommunityBankPreviewDialogProps = {
  bankId: string | null;
  open: boolean;
  onClose: () => void;
};

export function CommunityBankPreviewDialog({
  bankId,
  open,
  onClose,
}: CommunityBankPreviewDialogProps) {
  const { data, loading, error } = useQuestionBankDetailQueryQuery({
    variables: { id: bankId ?? "" },
    skip: !open || !bankId,
    fetchPolicy: "network-only",
  });

  const bank = data?.questionBank ?? null;
  const rows = buildQuestionBankRows(bank?.questions ?? []);

  if (!open || !bankId) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-32px)] w-full max-w-[860px] overflow-y-auto rounded-2xl border border-[#D0D5DD] bg-[#FAFAFA] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#EAECF0] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-semibold text-[#101828]">
                {bank?.title ?? "Shared bank preview"}
              </h3>
              <p className="mt-1 text-[14px] text-[#667085]">
                {bank
                  ? `${bank.subject} · ${bank.grade}-р анги · ${bank.questionCount} асуулт`
                  : "Question bank-ийг ачаалж байна..."}
              </p>
              {bank?.description ? (
                <p className="mt-2 text-[14px] text-[#52555B]">{bank.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-[14px] text-[#344054] hover:bg-white"
              onClick={onClose}
            >
              Хаах
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {loading && !bank ? (
            <div className="rounded-2xl border border-[#D0D5DD] bg-white px-4 py-6 text-[14px] text-[#52555B]">
              Shared bank-ийг ачаалж байна...
            </div>
          ) : null}

          {error && !bank ? (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-6 text-[14px] text-[#B42318]">
              Shared bank preview ачаалж чадсангүй.
            </div>
          ) : null}

          {bank
            ? rows.map((row, index) => {
                const tolerance = formatTolerance(row.tags);
                return (
                  <article
                    key={row.id}
                    className="rounded-2xl border border-[#D0D5DD] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#F2F4F7] px-2 py-1 text-[12px] text-[#344054]">
                          #{index + 1}
                        </span>
                        <span className="rounded-md border border-[#D0D5DD] px-2 py-1 text-[12px] text-[#344054]">
                          {row.type}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-[12px] ${row.difficultyTone}`}
                        >
                          {row.difficulty}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#667085]">{row.topic}</span>
                    </div>

                    <p className="mt-3 text-[15px] font-medium leading-6 text-[#0F172A]">
                      {row.prompt || row.text}
                    </p>

                    {row.rawType === "MCQ" ? (
                      <div className="mt-4 space-y-2">
                        {row.options.map((option, optionIndex) => (
                          <div
                            key={`${row.id}-${option}-${optionIndex}`}
                            className={`rounded-xl border px-3 py-2 text-[14px] ${
                              option === row.correctAnswer
                                ? "border-[#31AA4033] bg-[#31AA401A] text-[#0F172A]"
                                : "border-[#DFE1E5] text-[#344054]"
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] px-3 py-3 text-[14px] text-[#344054]">
                        {formatQuestionAnswer(row)}
                        {tolerance ? (
                          <p className="mt-2 text-[12px] text-[#667085]">
                            Хүлцэл: {tolerance}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
}
