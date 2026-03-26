import { ClipboardIcon, ClockIcon, CloseIcon } from "../icons";
import type { MyExamView } from "./my-exams-types";

type ExamPreviewDialogProps = {
  exam: MyExamView | null;
  open: boolean;
  onClose: () => void;
};

const optionRow =
  "flex items-center gap-2 rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216]";

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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={[
          "relative h-[1124px] w-[672px] max-w-[90vw]",
          "max-h-[calc(100vh-48px)] overflow-y-auto rounded-lg border",
          "border-[#DFE1E5] bg-[#FAFAFA]",
          "shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]",
        ].join(" ")}
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

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-[18px] font-semibold text-[#0F1216]">
              Урьдчилан харах: {exam.title}
            </h2>
            <p className="text-[14px] text-[#52555B]">
              Сурагчид шалгалтыг ингэж харах болно
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-[#DFE1E5] bg-[#F0F2F580] p-4 text-[14px] text-[#52555B]">
            <div className="flex flex-wrap items-center gap-4 text-[#0F1216]">
              <span className="flex items-center gap-2 text-[#0F1216]">
                <ClockIcon className="h-4 w-4 text-[#52555B]" />
                {exam.meta.find((item) => item.icon === ClockIcon)?.text ?? "-"}
              </span>
              <span className="flex items-center gap-2 text-[#0F1216]">
                <ClipboardIcon className="h-4 w-4 text-[#52555B]" />
                {exam.meta.find((item) => item.icon === ClipboardIcon)?.text ?? "-"}
              </span>
              <span className="text-[#52555B]">{exam.subject}</span>
            </div>
            <p>Бүх асуултад хариулна уу. Сурагчид харах урьдчилсан бүтэц энд байна.</p>
          </div>

          <div className="space-y-4">
            {exam.previewQuestions.map((question, index) => (
              <article key={question.id} className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F2F5] text-[12px] font-medium text-[#0F1216]">
                    {index + 1}
                </span>
                <div className="flex-1 space-y-3">
                    <p className="text-[14px] text-[#0F1216]">{question.prompt}</p>
                    {question.kind === "options" ? (
                      <div className="space-y-2">
                        {question.options.map((value) => (
                      <div key={value} className={optionRow}>
                        <span className="h-4 w-4 rounded border border-[#DFE1E5]" />
                        {value}
                      </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-[#DFE1E5] px-3 py-2 text-[14px] text-[#52555B]">
                        {question.kind === "upload"
                          ? "Зургаа оруулна уу..."
                          : "Хариултаа оруулна уу..."}
                      </div>
                    )}
                </div>
              </div>
            </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
