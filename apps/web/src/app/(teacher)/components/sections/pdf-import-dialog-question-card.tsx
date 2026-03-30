import { questionTypeLabels, type ImportJobView } from "./pdf-import-dialog-utils";

type ImportQuestion = ImportJobView["questions"][number];

export function PdfImportDialogQuestionCard({
  question,
}: {
  question: ImportQuestion;
}) {
  return (
    <div
      className={`rounded-[20px] border bg-white p-4 shadow-[0px_1px_2px_rgba(16,24,40,0.05)] ${
        question.needsReview
          ? "border-[#FDB022] ring-1 ring-[#FEDF89]"
          : "border-[#E4E7EC]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] font-medium text-[#344054]">
          #{question.order}
        </span>
        <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[12px] font-medium text-[#1D4ED8]">
          {questionTypeLabels[question.type]}
        </span>
        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[12px] font-medium text-[#475467]">
          {question.difficulty}
        </span>
        <span className="rounded-full bg-[#F9FAFB] px-2.5 py-1 text-[12px] font-medium text-[#475467]">
          {Math.round(question.confidence * 100)}%
        </span>
        {question.needsReview ? (
          <span className="rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[12px] font-medium text-[#C4320A]">
            Шалгах шаардлагатай
          </span>
        ) : null}
      </div>

      <h4 className="mt-3 text-[16px] font-semibold text-[#101828]">
        {question.title}
      </h4>
      <p className="mt-2 text-[14px] leading-6 text-[#475467]">{question.prompt}</p>

      {question.options.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {question.options.map((option) => (
            <span
              key={`${question.id}-${option}`}
              className="rounded-full border border-[#D0D5DD] bg-[#FCFCFD] px-3 py-1 text-[12px] font-medium text-[#344054]"
            >
              {option}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-[#667085]">
        <span>Зөв хариу: {question.answers.join(", ") || "Оруулаагүй"}</span>
        <span>Оноо: {question.score}</span>
        <span>Хуудас: {question.sourcePage ?? "-"}</span>
      </div>
    </div>
  );
}
