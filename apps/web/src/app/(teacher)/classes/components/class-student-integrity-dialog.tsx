"use client";

import { useEffect } from "react";
import { CloseIcon } from "../../components/icons";
import { formatRelativeTime } from "../classes-format";
import type { ClassStudentTableRow } from "../classes-view-model";
import { ClassStudentIntegrityEventList } from "./class-student-integrity-event-list";
import { ClassesStatusBadge } from "./classes-status-badge";

type ClassStudentIntegrityDialogProps = {
  row: ClassStudentTableRow | null;
  onClose: () => void;
};

function IntegritySummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-lg border border-[#DFE1E5] bg-white p-4">
      <p className="text-[12px] font-medium text-[#667085]">{label}</p>
      <p className="mt-2 text-[16px] font-semibold text-[#0F1216]">{value}</p>
    </section>
  );
}

export function ClassStudentIntegrityDialog({
  row,
  onClose,
}: ClassStudentIntegrityDialogProps) {
  useEffect(() => {
    if (!row) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, row]);

  if (!row) {
    return null;
  }

  const latestEvent = row.integrityEvents[0] ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-[880px] max-w-[96vw] overflow-y-auto rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_16px_24px_-4px_rgba(16,24,40,0.12),0px_6px_8px_-2px_rgba(16,24,40,0.08)]"
        style={{ maxHeight: "min(840px, calc(100vh - 48px))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-5 rounded-md p-2 text-[#52555B] hover:bg-white"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[20px] font-semibold text-[#0F1216]">
                Integrity дэлгэрэнгүй
              </h2>
              <ClassesStatusBadge
                label={row.integrityLabel}
                tone={row.integrityTone}
              />
            </div>
            <p className="text-[14px] text-[#52555B]">
              {row.name} · {row.email}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <IntegritySummaryCard
              label="Эрсдэл"
              value={row.integrityRiskLabel}
            />
            <IntegritySummaryCard
              label="Нийт flag"
              value={String(row.integrityEventCount)}
            />
            <IntegritySummaryCard
              label="Сүүлийн event"
              value={latestEvent ? formatRelativeTime(latestEvent.createdAt) : "Байхгүй"}
            />
            <IntegritySummaryCard
              label="Сүүлд идэвхтэй"
              value={row.lastActive}
            />
          </div>

          <section className="rounded-lg border border-[#DFE1E5] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#0F1216]">
                  Сигналын тойм
                </h3>
                <p className="mt-1 text-[13px] text-[#667085]">
                  Тухайн сурагч дээр бүртгэгдсэн suspicious signal-ууд
                </p>
              </div>
            </div>
            {row.integritySignals.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {row.integritySignals.map((signal) => (
                  <div
                    key={`${row.id}-${signal.label}-${signal.count}`}
                    className="min-w-[170px] rounded-lg border border-[#EAECF0] bg-[#F8FAFC] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium text-[#0F1216]">
                        {signal.label}
                      </p>
                      <ClassesStatusBadge
                        label={signal.severityLabel}
                        tone={signal.tone}
                      />
                    </div>
                    <p className="mt-2 text-[13px] text-[#667085]">
                      Нийт {signal.count}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-4 py-5 text-[14px] text-[#667085]">
                Одоогоор suspicious event бүртгэгдээгүй байна.
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[#DFE1E5] bg-white p-5">
            <div>
              <h3 className="text-[16px] font-semibold text-[#0F1216]">
                Event timeline
              </h3>
              <p className="mt-1 text-[13px] text-[#667085]">
                Хамгийн сүүлд бүртгэгдсэн event дээрээс эхэлж харагдана
              </p>
            </div>
            <ClassStudentIntegrityEventList events={row.integrityEvents} />
          </section>
        </div>
      </div>
    </div>
  );
}
