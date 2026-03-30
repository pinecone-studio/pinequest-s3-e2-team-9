"use client";

import { useMemo, useState } from "react";
import { CloseIcon } from "../icons";
import { ExamResultsReportDialog } from "./exam-results-report-dialog";
import { ExamResultsStudentDetailDialog } from "./exam-results-student-detail-dialog";
import { ExamResultsStudents } from "./exam-results-students";
import { ExamResultsSummary } from "./exam-results-summary";
import type { MyExamListView, MyExamStudentRow } from "./my-exams-types";
import { useMyExamDetail } from "./use-my-exam-detail";

type ExamResultsDialogProps = {
  exam: MyExamListView | null;
  open: boolean;
  onClose: () => void;
  onReviewSaved: () => Promise<unknown>;
};

export function ExamResultsDialog({
  exam,
  open,
  onClose,
  onReviewSaved,
}: ExamResultsDialogProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "students">(
    "summary",
  );
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const { detailExam, loading, error } = useMyExamDetail(exam, open);

  const selectedStudent = useMemo<MyExamStudentRow | null>(
    () =>
      selectedStudentId
        ? detailExam?.students.find((student) => student.id === selectedStudentId) ?? null
        : null,
    [detailExam, selectedStudentId],
  );

  if (!open || !exam) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={[
          "relative w-[768px] max-w-[92vw] overflow-y-auto",
          "rounded-lg border border-[#DFE1E5] bg-[#FAFAFA] p-6",
          "shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]",
        ].join(" ")}
        style={{ maxHeight: "min(765px, calc(100vh - 48px))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-5 text-[#0F1216B3] hover:text-[#0F1216]"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-[18px] font-semibold text-[#0F1216]">
              Үр дүн: {detailExam?.title ?? exam.title}
            </h2>
            <p className="text-[14px] text-[#52555B]">
              Сурагчдын гүйцэтгэлийн дэлгэрэнгүй мэдээлэл
            </p>
          </div>

          <div className="flex w-full items-center rounded-lg bg-[#F0F2F5] p-[3px]">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`flex-1 rounded-md px-4 py-1.5 text-[14px] font-medium text-[#0F1216] ${
                activeTab === "summary"
                  ? "bg-[#FAFAFA] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                  : ""
              }`}
            >
              Тойм
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`flex-1 rounded-md px-4 py-1.5 text-[14px] font-medium text-[#0F1216] ${
                activeTab === "students"
                  ? "bg-[#FAFAFA] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                  : ""
              }`}
            >
              Сурагчид
            </button>
          </div>

          {loading && !detailExam ? (
            <div className="flex items-center gap-3 rounded-lg border border-[#DFE1E5] bg-white px-4 py-3 text-[14px] text-[#52555B]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D0D5DD] border-t-[#155EEF]" />
              Үр дүнгийн мэдээлэл ачаалж байна...
            </div>
          ) : null}

          {error && !detailExam ? (
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B42318]">
              Үр дүнгийн мэдээлэл ачаалж чадсангүй.
            </div>
          ) : null}

          {detailExam ? (
            activeTab === "summary" ? (
              <ExamResultsSummary
                footer={detailExam.footer}
                onOpenReport={() => setIsReportOpen(true)}
              />
            ) : (
              <ExamResultsStudents
                rows={detailExam.students}
                onSelectStudent={(student) => setSelectedStudentId(student.id)}
              />
            )
          ) : null}
        </div>
      </div>
      <ExamResultsStudentDetailDialog
        open={Boolean(selectedStudent)}
        student={selectedStudent}
        exam={detailExam}
        onClose={() => setSelectedStudentId(null)}
        onReviewSaved={onReviewSaved}
      />
      <ExamResultsReportDialog
        open={isReportOpen}
        exam={detailExam}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
