"use client";

type CreateExamQuestionComposerFooterProps = {
  saveToBank: boolean;
  disabled: boolean;
  loading: boolean;
  bankSummary: string | null;
  errorMessage: string | null;
  onToggleSave: (value: boolean) => void;
  onOpenLibrary?: () => void;
  onCancel: () => void;
  onSubmit: () => void;
};

function SparkleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path d="m10 2 1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FromBankIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M11 4v7M8 4v7M5 5v6M3 3v9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" />
    </svg>
  );
}

export function CreateExamQuestionComposerFooter({
  saveToBank,
  disabled,
  loading,
  bankSummary,
  errorMessage,
  onToggleSave,
  onOpenLibrary,
  onCancel,
  onSubmit,
}: CreateExamQuestionComposerFooterProps) {
  return (
    <div className="space-y-6 border-t border-[#DFE1E5] pt-4">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[14px] leading-5 text-[#0F1216]">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-[4px] border border-[#DFE1E5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            checked={saveToBank}
            onChange={(event) => onToggleSave(event.target.checked)}
            disabled={disabled || loading}
          />
          <span>Save this question to Question Bank</span>
        </label>
        {bankSummary ? <p className="text-[13px] text-[#667085]">{bankSummary}</p> : null}
        {errorMessage ? <p className="text-[13px] text-[#B42318]">{errorMessage}</p> : null}
      </div>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center gap-[14px] rounded-[6px] border border-[#DFE1E5] bg-[#FAFAFA] px-[9.8px] text-[14px] font-medium leading-5 text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          onClick={onOpenLibrary}
          disabled={disabled || loading}
        >
          <FromBankIcon />
          From Bank
        </button>
        <div className="flex items-start gap-2 self-end">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-[6px] px-3 text-[14px] font-medium leading-5 text-[#0F1216]"
            onClick={onCancel}
            disabled={disabled || loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-[14px] rounded-[6px] bg-[#B7C8FF] px-[10px] text-[14px] font-medium leading-5 text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSubmit}
            disabled={disabled || loading}
          >
            <SparkleIcon />
            {loading ? "Adding..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
