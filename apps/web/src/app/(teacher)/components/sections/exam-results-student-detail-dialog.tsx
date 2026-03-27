"use client";

import { CloseIcon } from "../icons";
import type { MyExamStudentAnswer, MyExamStudentRow } from "./my-exams-types";

type ExamResultsStudentDetailDialogProps = {
  open: boolean;
  student: MyExamStudentRow | null;
  onClose: () => void;
};

const questionTypeLabel = (type: string) => {
  if (type === "MCQ") return "Олон сонголт";
  if (type === "TRUE_FALSE") return "Үнэн / Худал";
  if (type === "SHORT_ANSWER") return "Тоо бодолт";
  if (type === "ESSAY") return "Задгай хариулт";
  if (type === "IMAGE_UPLOAD") return "Зураг оруулах";
  return "Асуулт";
};

const isUrl = (value: string) => /^https?:\/\//i.test(value);

function AnswerValue({ answer }: { answer: MyExamStudentAnswer }) {
  if (isUrl(answer.value)) {
    return (
      <a
        href={answer.value}
        target="_blank"
        rel="noreferrer"
        className="text-[14px] font-medium text-[#155EEF] underline underline-offset-2"
      >
        Материал нээх
      </a>
    );
  }

  return (
    <div className="rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 py-2 text-[14px] leading-6 text-[#0F1216] whitespace-pre-wrap">
      {answer.value}
    </div>
  );
}

export function ExamResultsStudentDetailDialog({
  open,
  student,
  onClose,
}: ExamResultsStudentDetailDialogProps) {
  if (!open || !student) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-6"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="relative w-[760px] max-w-[94vw] rounded-xl border border-[#DFE1E5] bg-[#FAFAFA] p-6 shadow-[0px_16px_24px_-4px_rgba(16,24,40,0.12),0px_6px_8px_-2px_rgba(16,24,40,0.08)]"
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

        <div className="space-y-5 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 96px)" }}>
          <div className="space-y-2">
            <h3 className="text-[20px] font-semibold text-[#0F1216]">
              {student.name}
            </h3>
            <p className="text-[14px] text-[#52555B]">
              Бөглөсөн материал болон оруулсан хариултууд
            </p>
          </div>

          <div className="flex flex-wrap gap-3 rounded-lg border border-[#DFE1E5] bg-white p-4 text-[14px]">
            <span className="rounded-md bg-[#F2F4F7] px-3 py-1 text-[#344054]">
              {student.subject}
            </span>
            <span className="rounded-md bg-[#EEF4FF] px-3 py-1 text-[#1D4ED8]">
              Оноо: {student.score} / {student.total}
            </span>
            <span className="rounded-md bg-[#F4F3FF] px-3 py-1 text-[#5925DC]">
              Хувь: {student.percent}%
            </span>
            <span className={`rounded-md border px-3 py-1 ${student.statusTone}`}>
              {student.statusLabel}
            </span>
            <span className="rounded-md bg-[#F9FAFB] px-3 py-1 text-[#52555B]">
              Илгээсэн: {student.submitted}
            </span>
          </div>

          <div className="space-y-4">
            {student.answers.map((answer, index) => (
              <article
                key={answer.id}
                className="rounded-lg border border-[#DFE1E5] bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EEF4FF] px-2 text-[12px] font-semibold text-[#1D4ED8]">
                          {index + 1}
                        </span>
                        <span className="rounded-md border border-[#DFE1E5] bg-[#F9FAFB] px-2 py-0.5 text-[12px] font-medium text-[#344054]">
                          {questionTypeLabel(answer.type)}
                        </span>
                      </div>
                      <p className="text-[15px] font-medium leading-6 text-[#0F1216]">
                        {answer.prompt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="rounded-md border border-[#DFE1E5] bg-[#F9FAFB] px-2 py-1 text-[#344054]">
                        Оноо: {answer.score} / {answer.total}
                      </span>
                      <span className="rounded-md bg-[#F2F4F7] px-2 py-1 text-[#52555B]">
                        {answer.submitted}
                      </span>
                    </div>
                  </div>

                  <AnswerValue answer={answer} />

                  {answer.feedback ? (
                    <div className="rounded-md border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-[13px] text-[#946200]">
                      Тайлбар: {answer.feedback}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            {!student.answers.length ? (
              <div className="rounded-lg border border-dashed border-[#D0D5DD] bg-white px-4 py-8 text-center text-[14px] text-[#52555B]">
                Энэ сурагч одоогоор хариулт эсвэл материал илгээгээгүй байна.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
