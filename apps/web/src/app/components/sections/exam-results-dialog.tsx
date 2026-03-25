"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, CheckCircleIcon, CloseIcon } from "../icons";

type ExamResultsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function ExamResultsDialog({ open, onClose }: ExamResultsDialogProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "students">(
    "summary",
  );

  useEffect(() => {
    if (open) {
      setActiveTab("summary");
    }
  }, [open]);

  if (!open) {
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
        className="relative w-[768px] max-w-[92vw] overflow-y-auto rounded-lg border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
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
              Үр дүн: Физикийн улирлын шалгалт
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
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { value: "24", label: "Нийт сурагч", tone: "#0F1216" },
                  { value: "24", label: "Илгээсэн", tone: "#0F1216" },
                  { value: "85%", label: "Тэнцсэн хувь", tone: "#31AA40" },
                  { value: "78%", label: "Дундаж оноо", tone: "#0F1216" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-[#DFE1E5] bg-white px-4 py-3 text-center"
                  >
                    <div
                      className="text-[24px] font-semibold"
                      style={{ color: stat.tone }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[12px] text-[#52555B]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#DFE1E5] bg-white p-4">
                <h3 className="text-[14px] font-medium text-[#0F1216]">
                  Гүйцэтгэлийн задаргаа
                </h3>
                <div className="mt-3 space-y-2 text-[14px] text-[#0F1216]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-[#31AA40]" />
                      Тэнцсэн
                    </span>
                    <span className="font-medium text-[#31AA40]">20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#D40924] text-[#D40924]">
                        <CloseIcon className="h-2.5 w-2.5" />
                      </span>
                      Унасан
                    </span>
                    <span className="font-medium text-[#D40924]">4</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-[14px]">
                  <div className="flex items-center justify-between text-[#52555B]">
                    <span>Тэнцсэн хувь</span>
                    <span className="font-medium text-[#0F1216]">85%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#19223033]">
                    <div className="h-2 w-[85%] rounded-full bg-[#192230]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_1fr_0.5fr_0.7fr] items-center gap-4 px-2 text-[14px] font-medium text-[#0F1216]">
                <span>Сурагч</span>
                <span>Оноо</span>
                <span>Төлөв</span>
                <span>Илгээсэн</span>
                <span>Сэжиг</span>
                <span className="text-right">Үйлдэл</span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-1">
                  {[
                    {
                      name: "Sarah Williams",
                      subject: "Физик (сонгон)",
                      score: "68",
                      percent: "91%",
                      status: "Шалгасан",
                      submitted: "Feb 10, 3:20 PM",
                    },
                    {
                      name: "Chris Brown",
                      subject: "Physics Advanced",
                      score: "45",
                      percent: "60%",
                      status: "Graded",
                      submitted: "Feb 10, 3:30 PM",
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="grid grid-cols-[1.4fr_0.9fr_0.8fr_1fr_0.5fr_0.7fr] items-center gap-4 border-t border-[#E4E7EC] px-2 py-3 text-[14px]"
                    >
                      <div>
                        <div className="font-medium text-[#0F1216]">
                          {row.name}
                        </div>
                        <div className="text-[12px] text-[#52555B]">
                          {row.subject}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[#0F1216]">
                        <span className="font-medium">{row.score}</span>
                        <span className="text-[#52555B]">/ 75</span>
                        <span className="rounded-md border border-[#31AA4033] bg-[#31AA401A] px-2 py-0.5 text-[12px] font-medium text-[#31AA40]">
                          {row.percent}
                        </span>
                      </div>
                      <span className="rounded-md border border-[#31AA4033] bg-[#31AA401A] px-2 py-0.5 text-[12px] font-medium text-[#31AA40]">
                        {row.status}
                      </span>
                      <span className="text-[#52555B]">{row.submitted}</span>
                      <span className="text-[#52555B]">-</span>
                      <button
                        type="button"
                        className="flex items-center justify-end gap-2 text-[#0F1216]"
                      >
                        View
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
