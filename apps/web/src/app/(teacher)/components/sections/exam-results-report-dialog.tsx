"use client";

import { CloseIcon, DetailsIcon } from "../icons";
import { buildReportRows, downloadExamReportCsv, truncate } from "./exam-results-report-utils";
import type { MyExamView } from "./my-exams-types";

type ExamResultsReportDialogProps = {
  exam: MyExamView | null;
  open: boolean;
  onClose: () => void;
};

export function ExamResultsReportDialog({
  exam,
  open,
  onClose,
}: ExamResultsReportDialogProps) {
  if (!open || !exam) {
    return null;
  }

  const rows = buildReportRows(exam);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-[1200px] max-w-[96vw] rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_16px_24px_-4px_rgba(16,24,40,0.12),0px_6px_8px_-2px_rgba(16,24,40,0.08)]"
        style={{ maxHeight: "calc(100vh - 48px)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-5 cursor-pointer text-[#0F1216B3] hover:text-[#0F1216]"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="space-y-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 96px)" }}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#0F1216]">
                <DetailsIcon className="h-5 w-5" />
                <h3 className="text-[20px] font-semibold">Шалгалтын тайлан</h3>
              </div>
              <button
                type="button"
                onClick={() => downloadExamReportCsv(exam, rows)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F9FAFB]"
              >
                Excel татах
              </button>
            </div>
            <p className="text-[14px] text-[#52555B]">
              Excel маягийн preview. Доорх хүснэгтийг `.csv` файлаар татаж аваад Excel дээр нээж болно.
            </p>
          </div>

          <div className="rounded-lg border border-[#DFE1E5] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-[14px]">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                  <tr className="border-b border-[#DFE1E5]">
                    <th className="sticky left-0 min-w-[320px] bg-[#F8FAFC] px-4 py-3 font-semibold text-[#0F1216]">
                      Асуулт
                    </th>
                    {exam.students.map((student) => (
                      <th
                        key={student.id}
                        className="min-w-[140px] px-4 py-3 text-center font-semibold text-[#0F1216]"
                        title={student.name}
                      >
                        {truncate(student.name, 18)}
                      </th>
                    ))}
                    <th className="min-w-[140px] px-4 py-3 text-center font-semibold text-[#0F1216]">
                      Нийт оноо
                    </th>
                    <th className="min-w-[110px] px-4 py-3 text-center font-semibold text-[#0F1216]">
                      Хувь
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#FCFCFD]"}
                    >
                      <td className="sticky left-0 border-b border-[#EAECF0] bg-inherit px-4 py-3 align-top">
                        <div className="space-y-1">
                          <p
                            className="font-medium leading-6 text-[#0F1216]"
                            title={row.prompt}
                          >
                            {truncate(row.prompt, 88)}
                          </p>
                          <span className="text-[12px] text-[#667085]">
                            Нийт оноо: {row.total}
                          </span>
                        </div>
                      </td>
                      {row.scores.map((score, scoreIndex) => (
                        <td
                          key={`${row.id}-${exam.students[scoreIndex]?.id ?? scoreIndex}`}
                          className="border-b border-[#EAECF0] px-4 py-3 text-center font-medium text-[#0F1216]"
                        >
                          {score}
                        </td>
                      ))}
                      <td className="border-b border-[#EAECF0] px-4 py-3 text-center font-semibold text-[#0F1216]">
                        {row.earnedTotal}/{row.total * exam.students.length}
                      </td>
                      <td className="border-b border-[#EAECF0] px-4 py-3 text-center font-semibold text-[#155EEF]">
                        {row.percent}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#F8FAFC]">
                    <td className="sticky left-0 border-t border-[#D0D5DD] bg-[#F8FAFC] px-4 py-3 font-semibold text-[#0F1216]">
                      Нийт оноо
                    </td>
                    {exam.students.map((student) => (
                      <td
                        key={`total-${student.id}`}
                        className="border-t border-[#D0D5DD] px-4 py-3 text-center font-semibold text-[#0F1216]"
                      >
                        {student.score}/{student.total}
                      </td>
                    ))}
                    <td className="border-t border-[#D0D5DD] px-4 py-3" />
                    <td className="border-t border-[#D0D5DD] px-4 py-3" />
                  </tr>
                  <tr className="bg-[#F8FAFC]">
                    <td className="sticky left-0 border-t border-[#D0D5DD] bg-[#F8FAFC] px-4 py-3 font-semibold text-[#0F1216]">
                      Хувь
                    </td>
                    {exam.students.map((student) => (
                      <td
                        key={`percent-${student.id}`}
                        className="border-t border-[#D0D5DD] px-4 py-3 text-center font-semibold text-[#155EEF]"
                      >
                        {student.percent}%
                      </td>
                    ))}
                    <td className="border-t border-[#D0D5DD] px-4 py-3" />
                    <td className="border-t border-[#D0D5DD] px-4 py-3" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
