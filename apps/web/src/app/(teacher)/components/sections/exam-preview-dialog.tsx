import Link from "next/link";
import {
  PreviewFileIcon,
  PreviewInfoIcon,
  PreviewPencilIcon,
  PreviewTrashIcon,
} from "../icons";
import type { MyExamListView } from "./my-exams-types";
import { ExamPreviewQuestionCard } from "./exam-preview-question-card";
import { useMyExamDetail } from "./use-my-exam-detail";

type ExamPreviewDialogProps = {
  exam: MyExamListView | null;
  open: boolean;
  onClose: () => void;
};

export function ExamPreviewDialog({
  exam,
  open,
  onClose,
}: ExamPreviewDialogProps) {
  const { detailExam, loading, error } = useMyExamDetail(exam, open);

  if (!open || !exam) {
    return null;
  }

  const resolvedExam = detailExam;
  const canEdit = resolvedExam?.actions.edit ?? exam.actions.edit;
  const editHref = `/create-exam?${new URLSearchParams({
    examId: exam.id,
    returnTo: "/my-exams",
  }).toString()}`;

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
              {resolvedExam?.title ?? exam.title}
            </h2>
            <p className="text-[14px] leading-5 text-[#667085]">
              Шалгалтын дэлгэрэнгүй мэдээлэл
            </p>
          </div>

          {loading && !resolvedExam ? (
            <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3 text-[14px] text-[#52555B]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D0D5DD] border-t-[#155EEF]" />
              Шалгалтын дэлгэрэнгүйг ачаалж байна...
            </div>
          ) : null}

          {error && !resolvedExam ? (
            <div className="mt-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B42318]">
              Шалгалтын дэлгэрэнгүй мэдээлэл ачаалж чадсангүй.
            </div>
          ) : null}

          {resolvedExam ? (
            <>

          <section className="mt-4">
            <div className="flex items-center gap-2 text-[#161616]">
              <PreviewInfoIcon className="h-4 w-4 shrink-0" />
              <h3 className="text-[16px] font-medium leading-5">Үндсэн мэдээлэл</h3>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Хичээл:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {resolvedExam.subjectName || resolvedExam.subject}
                </p>
              </div>
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Үүсгэсэн:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {resolvedExam.createdDateLabel}
                </p>
              </div>
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Асуултын тоо:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {resolvedExam.questionCount}
                </p>
              </div>
              <div className="w-[146px]">
                <p className="text-[14px] leading-5 text-[#667085]">Нийт оноо:</p>
                <p className="text-[14px] font-medium leading-5 text-[#161616]">
                  {resolvedExam.totalPoints}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-4 h-px w-[599.2px] max-w-full bg-[#D0D5DD]" />

          <section className="mt-4">
            <div className="flex items-center gap-2 text-[#161616]">
              <PreviewFileIcon className="h-4 w-4 shrink-0" />
              <h3 className="text-[16px] font-medium leading-5">
                Асуултууд ({resolvedExam.previewQuestions.length})
              </h3>
            </div>

            <div className="mt-3 space-y-3">
              {resolvedExam.previewQuestions.map((question, index) => (
                <ExamPreviewQuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                />
              ))}
            </div>
          </section>

          <div className="mt-4 flex items-center gap-2 pb-[30px]">
            {canEdit ? (
              <Link
                href={editHref}
                onClick={onClose}
                className="flex h-[36px] flex-1 items-center justify-center gap-3 rounded-[8px] border border-[#D0D5DD] bg-white px-4 text-[16px] font-medium leading-5 text-[#161616]"
              >
                <PreviewPencilIcon className="h-4 w-4 shrink-0" />
                Асуултууд засах
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-[36px] flex-1 items-center justify-center gap-3 rounded-[8px] border border-[#EAECF0] bg-[#F8FAFC] px-4 text-[16px] font-medium leading-5 text-[#98A2B3]"
              >
                <PreviewPencilIcon className="h-4 w-4 shrink-0" />
                Засах боломжгүй
              </button>
            )}
            <button
              type="button"
              aria-label="Delete exam"
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[#101828] text-white"
            >
              <PreviewTrashIcon className="h-4 w-4 shrink-0" />
            </button>
          </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
