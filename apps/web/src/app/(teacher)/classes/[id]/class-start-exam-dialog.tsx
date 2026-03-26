"use client";

import { ClockIcon, UsersIcon } from "../../components/icons";

type ClassStartExamDialogProps = {
  examTitle: string;
  durationMinutes: number;
  activeStudentCount: number;
  totalStudentCount: number;
  open: boolean;
  submitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ClassStartExamDialog({
  examTitle,
  durationMinutes,
  activeStudentCount,
  totalStudentCount,
  open,
  submitting,
  errorMessage,
  onClose,
  onConfirm,
}: ClassStartExamDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0F1216]">Шалгалт эхлүүлэх</h2>
            <p className="mt-1 text-[14px] text-[#52555B]">
              Эхлүүлсний дараа хугацаа автоматаар явж эхэлнэ.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer text-[14px] text-[#52555B]"
            onClick={onClose}
          >
            Хаах
          </button>
        </div>

        <div className="mt-6 space-y-4 rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-5">
          <div>
            <p className="text-[13px] font-medium text-[#52555B]">Шалгалт</p>
            <p className="mt-1 text-[18px] font-semibold text-[#0F1216]">{examTitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] text-[#52555B]">
                <ClockIcon className="h-4 w-4" />
                Хугацаа
              </p>
              <p className="mt-2 text-[22px] font-semibold text-[#0F1216]">
                {durationMinutes} минут
              </p>
            </div>
            <div className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] text-[#52555B]">
                <UsersIcon className="h-4 w-4" />
                Идэвхтэй сурагч
              </p>
              <p className="mt-2 text-[22px] font-semibold text-[#0F1216]">
                {activeStudentCount}/{totalStudentCount}
              </p>
            </div>
          </div>
          <p className="text-[13px] text-[#52555B]">
            Одоогоор энэ ангид идэвхтэй байгаа сурагчдын тоог дээрх байдлаар тооцооллоо.
            Хугацаа дуусмагц шалгалт автоматаар хаагдана.
          </p>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-[13px] text-[#B42318]">{errorMessage}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="cursor-pointer rounded-md px-4 py-2 text-[14px] font-medium text-[#0F1216]"
            onClick={onClose}
          >
            Цуцлах
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-[#00267F] px-4 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? "Эхлүүлж байна..." : "Эхлүүлэх"}
          </button>
        </div>
      </div>
    </div>
  );
}
