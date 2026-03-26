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
    <>
      <div className="space-y-2 border-t border-[#DFE1E5] pt-4">
        <label className="flex items-center gap-2 text-[14px] text-[#0F1216]">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-[#DFE1E5]"
            checked={saveToBank}
            onChange={(event) => onToggleSave(event.target.checked)}
            disabled={disabled || loading}
          />
          Энэ асуултыг асуултын санд хадгалах
        </label>
        {bankSummary ? (
          <p className="text-[12px] text-[#52555B]">{bankSummary}</p>
        ) : null}
        {errorMessage ? (
          <p className="text-[12px] text-[#B42318]">{errorMessage}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          className="cursor-pointer rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-4 py-2 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          onClick={onOpenLibrary}
          disabled={disabled || loading}
        >
          Сангаас нэмэх
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-md px-4 py-2 text-[14px] font-medium text-[#0F1216]"
            onClick={onCancel}
            disabled={disabled || loading}
          >
            Цуцлах
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSubmit}
            disabled={disabled || loading}
          >
            {loading ? "Нэмж байна..." : "Асуулт нэмэх"}
          </button>
        </div>
      </div>
    </>
  );
}
