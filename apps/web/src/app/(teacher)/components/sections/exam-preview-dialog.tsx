import {
  PreviewFileIcon,
  PreviewInfoIcon,
  PreviewPencilIcon,
  PreviewTrashIcon,
} from "../icons";
import type { MyExamView } from "./my-exams-types";
import { ExamPreviewQuestionCard } from "./exam-preview-question-card";

type ExamPreviewDialogProps = {
  exam: MyExamView | null;
  open: boolean;
  onClose: () => void;
};

export function ExamPreviewDialog({
  exam,
  open,
  onClose,
}: ExamPreviewDialogProps) {
  if (!open || !exam) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="h-[925px] w-[672px] max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] overflow-y-auto rounded-[8px] border border-[#D0D5DD] bg-[#FAFAFA] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-[26px] mt-[30px] w-[620px] max-w-[calc(100%-52px)]">
          <div className="space-y-2">
            <h2 className="text-[18px] font-semibold leading-[18px] text-[#101828]">
              {exam.title}
            </h2>
            <p className="text-[14px] leading-5 text-[#667085]">
              Шалгалтын дэлгэрэнгүй мэдээлэл
            </p>
          </div>

          <section className="mt-4">
            <div className="flex items-center gap-2 text-[#161616]">
              <PreviewInfoIcon className="h-4 w-4 shrink-0" />
              <h3 className="text-[16px] font-medium leading-5">Үндсэн мэдээлэл</h3>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Хичээл:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {exam.subjectName || exam.subject}
                </p>
              </div>
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Үүсгэсэн:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {exam.createdDateLabel}
                </p>
              </div>
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Асуултын тоо:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {exam.questionCount}
                </p>
              </div>
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Нийт оноо:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {exam.totalPoints}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-4 h-px w-[599.2px] max-w-full bg-[#D0D5DD]" />

          <section className="mt-4">
            <div className="flex items-center gap-2 text-[#161616]">
              <PreviewFileIcon className="h-4 w-4 shrink-0" />
              <h3 className="text-[16px] font-medium leading-5">
                Асуултууд ({exam.previewQuestions.length})
              </h3>
            </div>

            <div className="mt-3 space-y-3">
              {exam.previewQuestions.map((question, index) => (
                <ExamPreviewQuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                />
              ))}
            </div>
          </section>

          <div className="mt-4 flex items-center gap-2 pb-[30px]">
            <button
              type="button"
              className="flex h-[36px] flex-1 items-center justify-center gap-3 rounded-[8px] border border-[#D0D5DD] bg-white px-4 text-[16px] font-medium leading-5 text-[#161616]"
            >
              <PreviewPencilIcon className="h-4 w-4 shrink-0" />
              Асуултууд засах
            </button>
            <button
              type="button"
              aria-label="Delete exam"
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[#101828] text-white"
            >
              <PreviewTrashIcon className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
