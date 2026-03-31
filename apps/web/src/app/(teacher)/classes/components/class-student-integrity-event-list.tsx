import {
  formatAbsoluteDateTime,
  formatIntegritySeverity,
  formatIntegritySignal,
  formatRelativeTime,
} from "../classes-format";
import type { ClassStudentIntegrityEventView } from "../classes-view-model";
import {
  getIntegrityDetailLines,
  getIntegrityEventTone,
} from "./class-student-integrity-dialog-format";
import { ClassesStatusBadge } from "./classes-status-badge";

type ClassStudentIntegrityEventListProps = {
  events: ClassStudentIntegrityEventView[];
};

export function ClassStudentIntegrityEventList({
  events,
}: ClassStudentIntegrityEventListProps) {
  if (events.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-4 py-5 text-[14px] text-[#667085]">
        Энэ сурагч дээр дэлгэрэнгүй event бүртгэгдээгүй байна.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {events.map((event) => (
        <article
          key={event.id}
          className="rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-semibold text-[#0F1216]">
                  {formatIntegritySignal(event.type)}
                </p>
                <ClassesStatusBadge
                  label={formatIntegritySeverity(event.severity)}
                  tone={getIntegrityEventTone(event.severity)}
                />
              </div>
              <p className="mt-1 text-[12px] text-[#667085]">
                {formatRelativeTime(event.createdAt)} · {formatAbsoluteDateTime(event.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {getIntegrityDetailLines(event.type, event.details).map((line) => (
              <span
                key={`${event.id}-${line}`}
                className="inline-flex rounded-md border border-[#D0D5DD] bg-white px-3 py-1.5 text-[12px] text-[#344054]"
              >
                {line}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
