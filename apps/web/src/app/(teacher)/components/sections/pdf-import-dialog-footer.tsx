import type { ImportJobView } from "./pdf-import-dialog-utils";

export function PdfImportDialogFooter({
  jobView,
  isCreating,
  isApproving,
  onClose,
  onImport,
  onApprove,
}: {
  jobView: ImportJobView | null;
  isCreating: boolean;
  isApproving: boolean;
  onClose: () => void;
  onImport: () => void;
  onApprove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#EAECF0] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-[#667085]">
        {jobView
          ? "Баталсны дараа импортолсон асуултууд шинэ question bank дотор хадгалагдана."
          : "Эхний алхамд import job үүсгээд draft асуултуудыг гаргаж ирнэ."}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#D0D5DD] bg-white px-5 text-[14px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
          onClick={onClose}
        >
          Хаах
        </button>
        {!jobView ? (
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#16A34A] px-5 text-[14px] font-medium text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onImport}
            disabled={isCreating}
          >
            {isCreating ? "Бэлтгэж байна..." : "PDF боловсруулж эхлэх"}
          </button>
        ) : !jobView.questionBank ? (
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#175CD3] px-5 text-[14px] font-medium text-white transition hover:bg-[#155EEF] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onApprove}
            disabled={isApproving}
          >
            {isApproving ? "Хадгалж байна..." : "Асуултын санд хадгалах"}
          </button>
        ) : (
          <a
            href={`/question-bank/${jobView.questionBank.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#175CD3] px-5 text-[14px] font-medium text-white transition hover:bg-[#155EEF]"
          >
            Асуултын сан руу очих
          </a>
        )}
      </div>
    </div>
  );
}
