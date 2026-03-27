type StudentExamSubmitDialogProps = {
  errorMessage: string | null;
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function StudentExamSubmitDialog({
  errorMessage,
  open,
  submitting,
  onClose,
  onConfirm,
}: StudentExamSubmitDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      onClick={submitting ? undefined : onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-[520px] rounded-[24px] border border-[#DFE1E5] bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rounded-[18px] bg-[#FFF7ED] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C4320A]">
            Илгээхээс өмнө баталгаажуулна уу
          </p>
          <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
            Шалгалт илгээх
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-[#475467]">
            Та шалгалтаа илгээхдээ итгэлтэй байна уу? Илгээсний дараа
            хариултаа дахин засах боломжгүй.
          </p>
        </div>

        {errorMessage ? (
          <p className="mt-5 rounded-[16px] bg-[#FEF3F2] px-4 py-3 text-[14px] font-medium text-[#B42318]">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#D0D5DD] px-5 text-[14px] font-semibold text-[#344054] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Болих
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[#2466D0] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(36,102,208,0.24)] disabled:cursor-not-allowed disabled:bg-[#98A2B3] disabled:shadow-none"
            disabled={submitting}
            onClick={onConfirm}
            type="button"
          >
            {submitting ? "Илгээж байна..." : "Илгээх"}
          </button>
        </div>
      </div>
    </div>
  );
}
