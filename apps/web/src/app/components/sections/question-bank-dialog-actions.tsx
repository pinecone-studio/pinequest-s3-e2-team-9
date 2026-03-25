"use client";

import { PlusIcon } from "../icons";
import { QuestionBankDialogSelect } from "./question-bank-dialog-fields";

type SaveSectionProps = {
  saveToBank: boolean;
  showBankSelect?: boolean;
  errorMessage?: string | null;
  onToggle: (checked: boolean) => void;
};

export function QuestionBankDialogSaveSection({
  saveToBank,
  showBankSelect,
  errorMessage,
  onToggle,
}: SaveSectionProps) {
  return (
    <>
      <label className="flex items-center gap-2 border-t border-[#DFE1E5] pt-4 text-[14px] text-[#0F1216]">
        <input
          type="checkbox"
          checked={saveToBank}
          onChange={(event) => onToggle(event.target.checked)}
          className="h-4 w-4 rounded border-[#DFE1E5]"
        />
        Энэ асуултыг асуултын санд хадгалах
      </label>
      {showBankSelect && saveToBank ? (
        <div className="max-w-[184px]">
          <QuestionBankDialogSelect disabled>
            <option>Асуултын сан сонгох</option>
          </QuestionBankDialogSelect>
        </div>
      ) : null}
      {errorMessage ? (
        <p className="text-[14px] text-[#B42318]">{errorMessage}</p>
      ) : null}
    </>
  );
}

type FooterProps = {
  disabled?: boolean;
  loading?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: () => void;
};

export function QuestionBankDialogFooter({
  disabled,
  loading,
  submitLabel = "Асуулт нэмэх",
  onCancel,
  onSubmit,
}: FooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#DFE1E5] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        className="inline-flex h-8 items-center justify-center rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-4 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
      >
        Сангаас нэмэх
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-md px-3 text-[14px] font-medium text-[#0F1216]"
          onClick={onCancel}
        >
          Цуцлах
        </button>
        <button
          type="button"
          disabled={loading || disabled}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-[#00267F] px-4 text-[14px] font-medium text-white disabled:opacity-50"
          onClick={onSubmit}
        >
          <PlusIcon className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
