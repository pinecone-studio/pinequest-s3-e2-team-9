"use client";

import { useState } from "react";
import { CloseIcon } from "../icons";
import { ExamResultsStudents } from "./exam-results-students";
import { ExamResultsSummary } from "./exam-results-summary";
import type { MyExamView } from "./my-exams-types";

type ExamResultsDialogProps = {
  exam: MyExamView | null;
  open: boolean;
  onClose: () => void;
};

export function ExamResultsDialog({
  exam,
  open,
  onClose,
}: ExamResultsDialogProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "students">(
    "summary",
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
              Үр дүн: {exam.title}
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

          {activeTab === "summary" ? (
            <ExamResultsSummary footer={exam.footer} />
          ) : (
            <ExamResultsStudents rows={exam.students} />
          )}
        </div>
      </div>
    </div>
  );
}
