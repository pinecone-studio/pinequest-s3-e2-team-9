"use client";

import type { ReactNode } from "react";

type CreateExamQuestionDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function CreateExamQuestionDrawer({
  open,
  title,
  description,
  onClose,
  children,
}: CreateExamQuestionDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-white shadow-[-12px_0px_24px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#DFE1E5] px-5 py-4">
          <div>
            <h3 className="text-[18px] font-semibold text-[#0F1216]">{title}</h3>
            {description ? (
              <p className="mt-1 text-[14px] text-[#52555B]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-md px-3 py-2 text-[14px] text-[#52555B]"
            onClick={onClose}
          >
            Хаах
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
