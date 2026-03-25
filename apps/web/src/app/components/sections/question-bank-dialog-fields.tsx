"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "../icons";

export function QuestionBankDialogSelect({
  value,
  disabled,
  children,
  onChange,
}: {
  value?: string;
  disabled?: boolean;
  children: ReactNode;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-[#DFE1E5] bg-white px-3 pr-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] disabled:text-[#52555B]"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
    </label>
  );
}

export function QuestionBankDialogMedia() {
  return (
    <div className="space-y-2">
      <span className="text-[12px] font-medium text-[#52555B]">
        Медиа (заавал биш)
      </span>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-lg border border-dashed border-[#DFE1E5] bg-white px-4 py-5 text-[12px] text-[#52555B]"
        >
          Зураг оруулах
        </button>
        <button
          type="button"
          className="rounded-lg border border-dashed border-[#DFE1E5] bg-white px-4 py-5 text-[12px] text-[#52555B]"
        >
          Видео оруулах
        </button>
      </div>
    </div>
  );
}
